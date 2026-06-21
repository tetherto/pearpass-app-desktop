/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/**
 * Electron main process: creates the window, starts pear-runtime (P2P OTA, bare workers, storage),
 * and registers secure IPC handlers so the renderer can use runtime and vault services.
 */

// ---- Global error guards ----
process.on('unhandledRejection', (reason, promise) => {
  try {
    const detail = reason instanceof Error
      ? `code=${reason.code} message=${reason.message} stack=${reason.stack?.split('\\n').slice(0, 5).join(' | ')}`
      : String(reason);
    process.stderr.write(`[PEARPASS] UNHANDLED_REJECTION ${detail}\n`);
  } catch { /* never throw from the error handler itself */ }
  // Do NOT rethrow or call process.exit — keep the process alive for triage
});

process.on('uncaughtException', (error) => {
  try {
    const detail = error instanceof Error
      ? `code=${error.code} message=${error.message} stack=${error.stack?.split('\\n').slice(0, 5).join(' | ')}`
      : String(error);
    process.stderr.write(`[PEARPASS] UNCAUGHT_EXCEPTION ${detail}\n`);
  } catch { /* never throw from the error handler itself */ }
  // Do NOT rethrow or call process.exit — keep the process alive for triage
});
// --------------------------------------------------------------------------------

const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  app,
  BrowserWindow,
  ipcMain,
  nativeImage,
  shell,
  clipboard
} = require('electron')
const PearRuntime = require('pear-runtime')
const getPearRuntimeLegacyStorage = require('pear-runtime-legacy-storage')
const { isLinux, isWindows, isMac } = require('which-runtime')

const { clearStaleVaultsDir } = require('./clearStaleVaultsDir.cjs')
// eslint-disable-next-line import/order
const { scheduleClipboardCleanup } = require('./clipboardCleanup.cjs')

let debugMode = false

;(async () => {
  try {
    const { DEBUG_MODE } = await import('../src/constants/appConstants.js')
    debugMode = DEBUG_MODE
  } catch {
    // fall back to default debugMode = false
  }
})()

const pkg = require('../package.json')
const {
  getSandboxSafePath,
  isFlatpakRuntime,
  isSnapRuntime
} = require('./flatpak-paths.cjs')
const { refreshNativeHostWrapperIfPresent } = require('./nativeHostWrapper.cjs')
const runtimeConfig = require('./runtime-config.cjs')
const devicePreferences = require('../src/utils/devicePreferences.cjs')
const {
  getLogPaths,
  removeLogFiles,
  setupLogging
} = require('../src/utils/logHelper.cjs')

const { logger, loggingForced, enableWorkletFileLogging } = setupLogging({
  app,
  pkg,
  debugMode,
  getStorageDir: () => getStorageDir(),
  getVaultClient: () => vaultClient
})

// Effective logging state. Initialized in app.whenReady (after setName, so
// getStorageDir() resolves correctly). Mutable so the in-app toggle can flip
// it at runtime via the vault:setLogging IPC.
let loggingActive = false

/**
 * Emit a structured startup marker to stderr.
 *
 * The main-process logger is a no-op when DEBUG_MODE=false (i.e. in every
 * packaged build), which means the CI smoke test has no way to observe
 * runtime progress and local failures can't be diagnosed from `journalctl`.
 * This helper writes directly to process.stderr so markers survive regardless
 * of logger configuration. Keep the output format stable — the flatpak smoke
 * test greps for `[PEARPASS] <NAME>` lines.
 */
function emitStartupMarker(name, detail) {
  try {
    const hasDetail = typeof detail === 'string' && detail.length > 0
    const line = hasDetail
      ? `[PEARPASS] ${name} ${detail}\n`
      : `[PEARPASS] ${name}\n`
    process.stderr.write(line)
  } catch {
    // never let the marker path break startup
  }
}

// Enable auto-reload during development for main + renderer code
if (!app.isPackaged) {
  try {
    // Watch the project root; electron-reload will restart Electron or
    // reload windows when files change. Renderer JS is rebuilt into dist/.
    require('electron-reload')(path.join(__dirname, '..'), {
      // Avoid watching node_modules to reduce noise
      ignored: /node_modules|[\/\\]\./,
      awaitWriteFinish: true
    })
  } catch (err) {
    logger.error('MAIN', 'Failed to enable electron-reload:', err)
  }
}

/** @type {import('electron').BrowserWindow | null} */
let mainWindow = null

/** @type {import('pear-runtime') | null} */
let pearRuntime = null

/** @type {import('bare-sidecar') | null} */
let workletSidecar = null

/** @type {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient | null} */
let vaultClient = null

function getExecPath() {
  if (!app.isPackaged) return null
  if (isLinux && process.env.APPIMAGE) return process.env.APPIMAGE
  if (isWindows) return true
  return path.join(process.resourcesPath, '..', '..')
}

function getWorkletPath() {
  const workletDir = path.join(
    'node_modules',
    '@tetherto/pearpass-lib-vault-core',
    'src',
    'worklet'
  )

  if (app.isPackaged) {
    // Packaged: Bare runs .js as CJS, so use the CJS bundle from build.worklet.mjs
    return path.join(process.resourcesPath, 'app', workletDir, 'app.cjs')
  }

  // Dev: ESM app.js so Bare's loader can resolve fs -> bare-fs etc.
  const appPath = app.getAppPath()
  return path.join(appPath, workletDir, 'app.js')
}

function getStorageDir() {
  return getSandboxSafePath(app.getPath('userData'))
}

// Resolve storage root for this pear app.
// 1) If the legacy Pear platform store knows this app (existing install),
//    use that path for full compatibility.
// 2) Otherwise, fall back to an Electron-owned per-link directory under
//    userData so multiple links can coexist on the same machine.
async function resolveRuntimeStorageDir() {
  const { legacyChannelLink, upgrade } = runtimeConfig || {}

  let storageDir = getStorageDir()
  const linkId = upgrade.replace(/^pear:\/\//, '')

  if (isFlatpakRuntime() || isSnapRuntime()) {
    storageDir = path.join(storageDir, 'app-storage', 'by-dkey', linkId)
    logger.info('[MAIN]', 'Using sandbox per-link storage root:', storageDir)
    return storageDir
  }

  try {
    const legacyStorageDir = legacyChannelLink
      ? await getPearRuntimeLegacyStorage(legacyChannelLink)
      : null

    if (legacyStorageDir) {
      storageDir = getSandboxSafePath(legacyStorageDir)
      logger.info('[MAIN]', 'Using pear legacy storage root:', storageDir)
    } else {
      storageDir = path.join(storageDir, 'app-storage', 'by-dkey', linkId)
      logger.warn(
        'MAIN',
        'pear-runtime-legacy-storage returned null; using per-link Electron storage:',
        storageDir
      )
    }
  } catch (err) {
    storageDir = path.join(getStorageDir(), 'app-storage', 'by-dkey', linkId)
    logger.warn(
      'MAIN',
      'Failed to resolve legacy pear storage, using per-link Electron storage:',
      legacyChannelLink,
      err && err.message ? err.message : err,
      'storageDir=',
      storageDir
    )
  }

  return storageDir
}

function getNativeBridgePath() {
  const bundleFile = path.join('dist', 'native-messaging-bridge.bundle.cjs')

  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app', bundleFile)
  }

  return path.join(app.getAppPath(), bundleFile)
}

function getRuntimeExecPath() {
  return isWindows && process.windowsStore
    ? path.join(
        process.env.LOCALAPPDATA,
        'Microsoft',
        'WindowsApps',
        path.basename(process.execPath)
      )
    : process.execPath
}

// AppImage mounts at a fresh /tmp/.mount_PearPa<random>/ each launch, so the
// execPath/bridgePath baked into the wrapper at pair time go stale. Rewrite.
async function refreshNativeHostWrapper() {
  // Snap mounts the app at a stable path, so wrapper paths don't drift.
  if (isSnapRuntime()) return

  const platform = os.platform()
  const executablePath = path.join(
    getStorageDir(),
    'native-messaging',
    platform === 'win32'
      ? 'pearpass-native-host.cmd'
      : 'pearpass-native-host.sh'
  )

  try {
    const result = await refreshNativeHostWrapperIfPresent({
      executablePath,
      electronExecPath: getRuntimeExecPath(),
      bridgeScriptPath: getNativeBridgePath(),
      platform,
      isFlatpak: isFlatpakRuntime()
    })
    if (result.refreshed) {
      logger.info(
        '[MAIN]',
        `Refreshed native messaging wrapper at ${executablePath}`
      )
    }
  } catch (err) {
    logger.warn(
      '[MAIN]',
      'Failed to refresh native messaging wrapper:',
      (err && err.message) || err
    )
  }
}

/**
 * In dev, when PEARPASS_DEV_RESET=1, clear vault/encryption data so the app
 * Only runs when NODE_ENV !== 'production'.
 */
function clearVaultStorageForDevReset(storageDir) {
  if (process.env.NODE_ENV === 'production') return
  if (process.env.PEARPASS_DEV_RESET !== '1') return

  const dirs = ['encryption', 'vaults', 'vault', 'pear-runtime']
  for (const name of dirs) {
    const dir = path.join(storageDir, name)
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
        logger.log('MAIN', `Dev reset: removed ${name} at ${dir}`)
      }
    } catch (err) {
      logger.warn(
        'MAIN',
        `Dev reset: failed to remove ${name} at ${dir}:`,
        err && err.message ? err.message : err
      )
    }
  }
}

const WORKLET_READY_TIMEOUT_MS = 15000
const WORKLET_READY_SIGNAL = 'WORKLET_READY'

function waitForWorkletReady(sidecar) {
  const ipcStream = sidecar?._process?.stdio?.[3]
  if (ipcStream) {
    // Having an IPC pipe is treated as "ready enough" — bare-sidecar has
    // already finished its side of the handshake.
    emitStartupMarker('WORKLET_READY', 'via=ipc-stream')
    return Promise.resolve(true)
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      cleanup()
      emitStartupMarker(
        'WORKLET_READY_TIMEOUT',
        `ms=${WORKLET_READY_TIMEOUT_MS}`
      )
      resolve(false)
    }, WORKLET_READY_TIMEOUT_MS)
    let buffer = ''
    const onData = (d) => {
      const s = (d && (typeof d === 'string' ? d : d.toString?.())) || ''
      buffer += s
      if (buffer.includes(WORKLET_READY_SIGNAL)) {
        cleanup()
        emitStartupMarker('WORKLET_READY', 'via=stdio-signal')
        resolve(true)
      }
    }
    const cleanup = () => {
      clearTimeout(timeout)
      if (sidecar.stderr) sidecar.stderr.removeListener('data', onData)
      if (sidecar.stdout) sidecar.stdout.removeListener('data', onData)
    }
    sidecar.stderr?.on?.('data', onData)
    sidecar.stdout?.on?.('data', onData)
  })
}
/**
 * Start pear-runtime and the vault worklet (bare worker). Called after app is ready.
 */
async function startRuntime() {
  const upgrade = runtimeConfig.upgrade

  if (!upgrade) {
    logger.warn(
      'MAIN',
      'Pear runtime: no upgrade link configured. Running without P2P OTA.'
    )
    await startWorkletOnly()
    return
  }

  const storageDir = getStorageDir()

  // to clear local vault/encryption data so the app starts from scratch.
  clearVaultStorageForDevReset(storageDir)
  const workletPath = getWorkletPath()

  const { PearpassVaultClient } = await import(
    '@tetherto/pearpass-lib-vault-core'
  )
  const extension = isLinux ? '.AppImage' : isMac ? '.app' : '.msix'

  pearRuntime = new PearRuntime({
    // pear runtime doesn't care about pear (platform) directory
    dir: storageDir,
    upgrade,
    version: runtimeConfig.version,
    app: app.isPackaged ? getExecPath() : null,
    bundled: !!app.isPackaged,
    name: `${pkg.productName}${extension}`
  })

  await pearRuntime.ready()

  logger.info('[MAIN]', 'workletPath', workletPath)
  if (!fs.existsSync(workletPath)) {
    throw new Error(`Worklet not found: ${workletPath}`)
  }

  workletSidecar = pearRuntime.run(workletPath)
  emitStartupMarker('WORKLET_SPAWNED', 'mode=pear-runtime')
  workletSidecar.on('error', (err) => {
    logger.error('MAIN', '[worklet IPC error]', err.code || err.message, err)
  })
  const ipcStream = workletSidecar._process?.stdio?.[3]
  if (ipcStream)
    ipcStream.on('error', (err) => {
      logger.error(
        'MAIN',
        '[worklet IPC pipe error]',
        err.code || err.message,
        err
      )
    })
  workletSidecar.stderr?.on('data', (d) =>
    logger.error('MAIN', '[worklet stderr]', d?.toString?.() || d)
  )
  workletSidecar.stdout?.on('data', (d) =>
    logger.log('MAIN', '[worklet stdout]', d?.toString?.() || d)
  )
  workletSidecar._process?.on?.('exit', (code, sig) => {
    logger.error('MAIN', '[worklet exit] code=', code, 'signal=', sig)
  })
  workletSidecar._process?.on?.('error', (err) => {
    logger.error('MAIN', '[worklet process error]', err)
  })
  await waitForWorkletReady(workletSidecar)
  const storagePath = await resolveRuntimeStorageDir()
  emitStartupMarker('STORAGE_PATH_SET', storagePath)
  try {
    vaultClient = new PearpassVaultClient(workletSidecar, storagePath, {
      debugMode,
      logger
    })
    emitStartupMarker('VAULT_CLIENT_READY')
  } catch (error) {
    emitStartupMarker(
      'VAULT_CLIENT_ERROR',
      (error && (error.stack || error.message)) || String(error)
    )
    throw error
  }

  if (loggingActive) {
    await enableWorkletFileLogging()
  }

  vaultClient.on('update', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:update')
    }
  })

  vaultClient.on('master-update', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:master-update')
    }
  })

  vaultClient.on('personal-swarm-envelope', (msg) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:personal-swarm-envelope', msg)
    }
  })

  pearRuntime.updater.on('updating', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      logger.info('runtime:updating', 'sending updating event')
      mainWindow.webContents.send('runtime:updating')
    }
  })

  pearRuntime.updater.on('updated', async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      logger.info('runtime:updated', 'sending updated event')
      await pearRuntime.updater.applyUpdate()
      mainWindow.webContents.send('runtime:updated')
    }
  })
}

/**
 * Run only the worklet via bare-sidecar (no P2P runtime). Used when no upgrade link is set (e.g. dev).
 */
async function startWorkletOnly() {
  // When there is no upgrade link, we don't need pear-runtime's full
  // update machinery – we just need to run the worklet via bare-sidecar.
  // bare-sidecar is a dependency of pear-runtime and will be hoisted into
  // this app's node_modules, so we can require it directly.
  const Sidecar = require('bare-sidecar')
  const { PearpassVaultClient } = await import(
    '@tetherto/pearpass-lib-vault-core'
  )

  const workletPath = getWorkletPath()
  if (!fs.existsSync(workletPath)) {
    throw new Error(`Worklet not found: ${workletPath}`)
  }

  // Dev-only: allow `PEARPASS_DEV_RESET=1 npm run dev` (or `npm run dev:reset`)
  // to clear local vault/encryption data so the app starts from scratch.
  clearVaultStorageForDevReset(getStorageDir())

  // In packaged builds, Bare's module resolution uses the process cwd.
  let previousCwd = null
  if (app.isPackaged) {
    const appRoot = path.join(process.resourcesPath, 'app')
    if (fs.existsSync(appRoot)) {
      previousCwd = process.cwd()
      process.chdir(appRoot)
      logger.log('MAIN', 'Worklet cwd set to', appRoot)
    }
  }

  try {
    workletSidecar = new Sidecar(workletPath)
  } finally {
    if (previousCwd !== null) {
      process.chdir(previousCwd)
    }
  }
  emitStartupMarker('WORKLET_SPAWNED', 'mode=bare-sidecar')
  workletSidecar.on('error', (err) => {
    logger.error('MAIN', '[worklet IPC error]', err.code || err.message, err)
  })
  const ipcStream = workletSidecar._process?.stdio?.[3]
  if (ipcStream)
    ipcStream.on('error', (err) => {
      logger.error(
        'MAIN',
        '[worklet IPC pipe error]',
        err.code || err.message,
        err
      )
    })
  workletSidecar.stderr?.on('data', (d) =>
    logger.error('MAIN', '[worklet stderr]', d?.toString?.() || d)
  )
  workletSidecar.stdout?.on('data', (d) =>
    logger.log('MAIN', '[worklet stdout]', d?.toString?.() || d)
  )
  workletSidecar._process?.on?.('exit', (code, sig) => {
    logger.error('MAIN', '[worklet exit] code=', code, 'signal=', sig)
  })
  workletSidecar._process?.on?.('error', (err) => {
    logger.error('MAIN', '[worklet process error]', err)
  })
  await waitForWorkletReady(workletSidecar)
  const storagePath = getStorageDir()
  emitStartupMarker('STORAGE_PATH_SET', storagePath)
  try {
    vaultClient = new PearpassVaultClient(workletSidecar, storagePath, {
      debugMode,
      logger
    })
    emitStartupMarker('VAULT_CLIENT_READY')
  } catch (error) {
    emitStartupMarker(
      'VAULT_CLIENT_ERROR',
      (error && (error.stack || error.message)) || String(error)
    )
    throw error
  }

  if (loggingActive) {
    await enableWorkletFileLogging()
  }

  vaultClient.on('update', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:update')
    }
  })

  vaultClient.on('master-update', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:master-update')
    }
  })

  vaultClient.on('personal-swarm-envelope', (msg) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:personal-swarm-envelope', msg)
    }
  })
}

function createWindow() {
  const isV2 = runtimeConfig.designVersion === 2
  // Resolve app icon per-platform
  let iconPath = null
  if (process.platform === 'darwin') {
    iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'darwin', 'icon.png')
      : path.join(__dirname, '..', 'assets', 'darwin', 'icon.png')
  } else if (process.platform === 'win32') {
    iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'win32', 'icon.ico')
      : path.join(__dirname, '..', 'assets', 'win32', 'icon.ico')
  } else {
    iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'linux', 'icon.png')
      : path.join(__dirname, '..', 'assets', 'linux', 'icon.png')
  }

  let iconImage = null
  try {
    iconImage = nativeImage.createFromPath(iconPath)
  } catch {
    iconImage = null
  }

  // Set Dock icon explicitly on macOS
  if (process.platform === 'darwin' && iconImage && !iconImage.isEmpty()) {
    try {
      app.dock.setIcon(iconImage)
    } catch {
      // ignore dock icon errors
    }
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 1024,
    minWidth: 816,
    ...(isMac && isV2
      ? {
          titleBarStyle: 'hidden',
          trafficLightPosition: { x: 18, y: 12 }
        }
      : {}),
    backgroundColor: '#1F2430',
    icon: iconPath && iconImage && !iconImage.isEmpty() ? iconPath : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'))
  emitStartupMarker('WINDOW_CREATED')

  // Open external links in the default browser instead of the Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appUrl = mainWindow.webContents.getURL()
    if (url !== appUrl) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function fromSerializableArg(data) {
  if (data && typeof data === 'object' && data.__base64) {
    return Buffer.from(data.__base64, 'base64')
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const out = {}
    for (const k of Object.keys(data)) {
      out[k] = fromSerializableArg(data[k])
    }
    return out
  }
  if (Array.isArray(data)) {
    return data.map(fromSerializableArg)
  }
  return data
}

function toSerializableArg(value) {
  if (Buffer.isBuffer(value)) {
    return { __base64: value.toString('base64') }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const out = {}
    for (const k of Object.keys(value)) {
      out[k] = toSerializableArg(value[k])
    }
    return out
  }
  if (Array.isArray(value)) {
    return value.map(toSerializableArg)
  }
  return value
}

function registerIPC() {
  ipcMain.on('get-app-path', (e) => {
    e.returnValue = app.getAppPath()
  })

  ipcMain.handle('app:getVersion', () => app.getVersion())

  ipcMain.handle('runtime:getConfig', async () => {
    const storage = await resolveRuntimeStorageDir()
    return {
      storage,
      key: runtimeConfig.upgrade || null,
      upgrade: runtimeConfig.upgrade,
      version: runtimeConfig.version,
      productName: runtimeConfig.productName,
      applink: runtimeConfig.upgrade || '',
      userDataPath: getStorageDir(),
      execPath: getRuntimeExecPath(),
      bridgePath: getNativeBridgePath()
    }
  })

  ipcMain.handle('runtime:applyUpdate', async () => {
    logger.info(
      '[MAIN]',
      'runtime:applyUpdate',
      pearRuntime?.updater?.applyUpdate
    )
    return await pearRuntime.updater.applyUpdate()
  })

  ipcMain.handle('runtime:restart', async () => {
    logger.info('[MAIN]', 'runtime:restart')
    if (isMac || isLinux) {
      app.relaunch()
      app.exit(0)
    } else {
      app.exit(0)
    }
  })

  ipcMain.handle(
    'runtime:checkUpdated',
    async () => !!(pearRuntime && pearRuntime.updated)
  )

  ipcMain.handle('shell:openExternal', async (_event, url) => {
    await shell.openExternal(url)
  })

  ipcMain.handle('vault:invoke', async (_event, { method, args }) => {
    if (!vaultClient) {
      throw new Error('Vault client not ready')
    }
    const fn = vaultClient[method]
    if (typeof fn !== 'function') {
      throw new Error(`Unknown vault method: ${method}`)
    }
    const rawArgs = args || []
    const deserialized = rawArgs.map(fromSerializableArg)

    // Diagnostic: log auth-sensitive vault calls (gated — off in production)
    const AUTH_METHODS = [
      'initWithCredentials',
      'initWithPassword',
      'getMasterPasswordStatus',
      'recordFailedMasterPassword',
      'resetFailedAttempts',
      'createMasterPassword',
      'updateMasterPassword',
      'encryptionInit',
      'encryptionGetStatus',
      'hashPassword',
      'encryptVaultKeyWithHashedPassword'
    ]
    const debugVaultCalls = process.env.PEARPASS_DEBUG_VAULT_CALLS === 'true'
    if (debugVaultCalls && AUTH_METHODS.includes(method)) {
      logger.info('MAIN', `[vault:invoke] → ${method}`, {
        argKeys: rawArgs.map((a, i) => {
          if (a && typeof a === 'object' && !Array.isArray(a)) {
            return `[${i}]:{${Object.keys(a).join(',')}}`
          }
          if (a === undefined) return `[${i}]:undefined`
          if (a === null) return `[${i}]:null`
          return `[${i}]:${typeof a}`
        })
      })
    }
    // End diagnostic

    try {
      const result = await fn.apply(vaultClient, deserialized)
      if (debugVaultCalls && AUTH_METHODS.includes(method)) {
        logger.info('MAIN', `[vault:invoke] ✓ ${method} OK`, { hasData: result !== undefined })
      }
      return { ok: true, data: toSerializableArg(result) }
    } catch (err) {
      if (debugVaultCalls && AUTH_METHODS.includes(method)) {
        logger.error('MAIN', `[vault:invoke] ✗ ${method} FAILED`, {
          code: err?.code,
          message: err?.message ?? String(err),
          stack: err?.stack?.split('\n').slice(0, 5).join('\n')
        })
      }
      return {
        ok: false,
        error: err?.message ?? String(err),
        code: err?.code
      }
    }
  })

  ipcMain.handle('clipboard:clearAfter', async (_event, { text, delayMs }) =>
    scheduleClipboardCleanup({
      app,
      clipboard,
      logger,
      isWindows,
      text,
      delayMs
    })
  )

  ipcMain.handle('vault:clearStaleVaultsDir', async () => {
    const storagePath = await resolveRuntimeStorageDir()
    await clearStaleVaultsDir({ storagePath, logger })
  })

  ipcMain.handle('vault:openLogsFolder', async () => {
    const { logsDir, mainPath } = getLogPaths(getStorageDir())
    fs.mkdirSync(logsDir, { recursive: true })
    if (fs.existsSync(mainPath)) {
      shell.showItemInFolder(mainPath)
    } else {
      await shell.openPath(logsDir)
    }
  })

  ipcMain.handle('vault:isLoggingEnabled', () => ({
    enabled: loggingActive,
    forced: loggingForced
  }))

  ipcMain.handle('vault:setLogging', async (_event, payload) => {
    if (loggingForced) {
      return { enabled: true, forced: true }
    }

    const next = !!(payload && payload.enabled)
    if (next === loggingActive) {
      return { enabled: loggingActive, forced: false }
    }

    loggingActive = next
    try {
      devicePreferences.write(getStorageDir(), {
        loggingEnabled: loggingActive
      })
    } catch (err) {
      logger.warn('MAIN', 'Failed to persist device preferences', err)
    }

    if (loggingActive) {
      // Toggle ON: clear any leftover files for a clean session
      removeLogFiles(getStorageDir())
      logger.setLogPath(getStorageDir())
      await enableWorkletFileLogging()
      return { enabled: true, forced: false }
    }

    // Toggle OFF: stop worklet writes first, then close main.
    if (vaultClient) {
      try {
        await vaultClient.setLogOptions({ logFile: null })
      } catch (err) {
        logger.warn('MAIN', 'setLogOptions(disable) failed', err)
      }
    }
    logger.clearLogPath()
    return { enabled: false, forced: false }
  })

  // ---- Touch ID / Biometric (native N-API addon, biometric-gated keychain) ----
  // Uses kSecAccessControlBiometryCurrentSet — the OS requires a real
  // Touch ID / Face ID scan before releasing stored data.

  let biometricKeychain = null
  try {
    biometricKeychain = require('./native-biometric')
  } catch {
    logger.warn('MAIN', 'Native biometric-keychain addon failed to load — biometric unlock will be unavailable')
  }

  function isBiometricUsable() {
    if (process.platform !== 'darwin') return false
    if (!biometricKeychain) return false
    return true
  }

  const BIOMETRIC_SERVICE = 'com.pears.pass.biometric'
  const BIOMETRIC_ACCOUNT = 'master-credentials'

  // Check if biometric auth is available (macOS with Touch ID/Face ID)
  ipcMain.handle('biometric:isAvailable', async () => {
    if (!isBiometricUsable()) return false
    try {
      return biometricKeychain.isAvailable()
    } catch {
      return false
    }
  })

  // Store Argon2id-derived vault credentials (not the raw master password)
  ipcMain.handle('biometric:storeCredentials', async (_event, credentials) => {
    if (!isBiometricUsable()) {
      throw new Error('Biometric authentication is only supported on macOS')
    }
    try {
      const data = Buffer.from(JSON.stringify(credentials), 'utf8')
      logger.info('MAIN', 'Storing biometric credentials', {
        hasCiphertext: !!credentials?.ciphertext,
        hasNonce: !!credentials?.nonce,
        hasSalt: !!credentials?.salt,
        hasHashedPassword: !!credentials?.hashedPassword,
      })
      await biometricKeychain.store(BIOMETRIC_SERVICE, BIOMETRIC_ACCOUNT, data)
      logger.info('MAIN', 'Biometric credentials stored successfully')
      return true
    } catch (error) {
      logger.error('MAIN', 'Biometric keychain store failed', { code: error.code, message: error.message })
      throw new Error(`Biometric keychain store failed: ${error.message}`)
    }
  })

  // Retrieve vault credentials — OS shows biometric dialog; keychain
  // refuses release without a scan (kSecAccessControlBiometryCurrentSet).
  ipcMain.handle('biometric:retrieveCredentials', async (_event, reason) => {
    if (!isBiometricUsable()) {
      throw new Error('Biometric authentication is only supported on macOS')
    }
    try {
      const data = await biometricKeychain.retrieve(
        BIOMETRIC_SERVICE,
        BIOMETRIC_ACCOUNT,
        reason || 'Authenticate to PearPass'
      )
      const credentials = JSON.parse(data.toString('utf8'))
      return { success: true, credentials }
    } catch (error) {
      const errDetail = { code: error.code, message: error.message }
      if (error.code === 'ERR_USER_CANCELED') {
        logger.warn('MAIN', 'Biometric retrieval cancelled by user', errDetail)
      } else if (error.code === 'ERR_AUTH_FAILED') {
        logger.warn('MAIN', 'Biometric authentication failed (too many attempts / no match)', errDetail)
      } else if (error.code === 'ERR_ITEM_NOT_FOUND') {
        logger.warn('MAIN', 'Biometric credentials not found in keychain', errDetail)
      } else {
        logger.error('MAIN', 'Biometric credential retrieval failed', error)
      }
      return { success: false, credentials: null }
    }
  })

  // Delete biometric credentials (called when user disables Touch ID)
  ipcMain.handle('biometric:deleteCredentials', async () => {
    if (!isBiometricUsable()) return false
    try {
      await biometricKeychain.remove(BIOMETRIC_SERVICE, BIOMETRIC_ACCOUNT)
      return true
    } catch (error) {
      logger.warn('MAIN', 'Biometric credential deletion failed', error)
      return false
    }
  })
}

app.whenReady().then(async () => {
  emitStartupMarker('PEARPASS_MAIN_READY')
  app.setName(pkg.productName)
  const { loggingEnabled } = devicePreferences.read(getStorageDir())
  loggingActive = loggingForced || loggingEnabled
  if (loggingActive) {
    logger.setLogPath(getStorageDir())
  }
  registerIPC()
  await refreshNativeHostWrapper()
  try {
    await startRuntime()
  } catch (err) {
    emitStartupMarker(
      'STARTUP_ERROR',
      (err && (err.stack || err.message)) || String(err)
    )
    logger.error('MAIN', 'Failed to start runtime/worklet:', err)
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

async function cleanup() {
  if (workletSidecar) {
    try {
      workletSidecar.destroy()
    } catch (_) {}
  }
  if (pearRuntime && typeof pearRuntime.close === 'function') {
    try {
      await pearRuntime.close()
    } catch (_) {}
  }
}

app.on('window-all-closed', async () => {
  app.quit()
})

app.on('before-quit', async () => {
  await cleanup()
})
