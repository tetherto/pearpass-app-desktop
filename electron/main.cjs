/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/**
 * Electron main process: creates the window, starts pear-runtime (P2P OTA, bare workers, storage),
 * and registers secure IPC handlers so the renderer can use runtime and vault services.
 */
const fs = require('fs')
const path = require('path')

const { app, BrowserWindow, ipcMain, nativeImage } = require('electron')
const PearRuntime = require('pear-runtime')
const getPearRuntimeLegacyStorage = require('pear-runtime-legacy-storage')
const { isLinux, isWindows } = require('which-runtime')

const runtimeConfig = require('./runtime-config.cjs')
const {
  createMainProcessLogger
} = require('../src/utils/createMainProcessLogger.cjs')

const logger = createMainProcessLogger({ app, debugMode: true })

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

/** @type {import('pearpass-lib-vault-core').PearpassVaultClient | null} */
let vaultClient = null

function getExecPath() {
  if (!app.isPackaged) return null
  if (isLinux && process.env.APPIMAGE) return process.env.APPIMAGE
  if (isWindows) return process.execPath
  return path.join(process.resourcesPath, '..', '..')
}

function getWorkletPath() {
  const workletDir = path.join(
    'node_modules',
    'pearpass-lib-vault-core',
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
  return app.getPath('userData')
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
  return new Promise((resolve, _) => {
    const timeout = setTimeout(() => {
      cleanup()
      resolve() // proceed anyway after timeout so app can try to work
    }, WORKLET_READY_TIMEOUT_MS)
    let buffer = ''
    const onData = (d) => {
      const s = (d && (typeof d === 'string' ? d : d.toString?.())) || ''
      buffer += s
      if (buffer.includes(WORKLET_READY_SIGNAL)) {
        cleanup()
        resolve()
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

  // Resolve storage root for this pear app.
  // 1) If the legacy Pear platform store knows this app (existing install),
  //    use that path for full compatibility.
  // 2) Otherwise, fall back to an Electron-owned per-link directory under
  //    userData so multiple links can coexist on the same machine.
  let storageDir = getStorageDir()
  try {
    const pearStorageDir = await getPearRuntimeLegacyStorage(upgrade)
    if (pearStorageDir) {
      storageDir = pearStorageDir
      logger.info('[MAIN]', 'Using pear legacy storage root:', storageDir)
    } else {
      const linkId = upgrade.replace(/^pear:\/\//, '')
      storageDir = path.join(storageDir, 'app-storage', 'by-dkey', linkId)
      logger.warn(
        'MAIN',
        'pear-runtime-legacy-storage returned null; using per-link Electron storage:',
        storageDir
      )
    }
  } catch (err) {
    const linkId = upgrade.replace(/^pear:\/\//, '')
    storageDir = path.join(getStorageDir(), 'app-storage', 'by-dkey', linkId)
    logger.warn(
      'MAIN',
      'Failed to resolve legacy pear storage for upgrade link, using per-link Electron storage:',
      upgrade,
      err && err.message ? err.message : err,
      'storageDir=',
      storageDir
    )
  }

  // to clear local vault/encryption data so the app starts from scratch.
  clearVaultStorageForDevReset(storageDir)
  const workletPath = getWorkletPath()

  const { PearpassVaultClient } = await import('pearpass-lib-vault-core')
  pearRuntime = new PearRuntime({
    // pear runtime doesn't care about pear (platform) directory
    dir: storageDir,
    upgrade,
    version: runtimeConfig.version,
    app: app.isPackaged ? getExecPath() : null,
    bundled: !!app.isPackaged,
    name: 'pearpass-app-desktop/app/PearPass.app'
  })

  await pearRuntime.ready()

  logger.info('[MAIN]', 'workletPath', workletPath)
  if (!fs.existsSync(workletPath)) {
    throw new Error(`Worklet not found: ${workletPath}`)
  }

  workletSidecar = pearRuntime.run(workletPath)
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
  vaultClient = new PearpassVaultClient(workletSidecar, storageDir, {
    debugMode: true
  })

  vaultClient.on('update', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:update')
    }
  })

  pearRuntime.updater.on('updating', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      logger.info('runtime:updating', 'sending updating event')
      mainWindow.webContents.send('runtime:updating')
    }
  })

  pearRuntime.updater.on('updated', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      logger.info('runtime:updated', 'sending updated event')
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
  const { PearpassVaultClient } = await import('pearpass-lib-vault-core')

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
  vaultClient = new PearpassVaultClient(workletSidecar, getStorageDir(), {
    debugMode: true
  })

  vaultClient.on('update', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vault:update')
    }
  })
}

function createWindow() {
  // Resolve app icon per-platform
  let iconPath = null
  if (process.platform === 'darwin') {
    iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'darwin', 'icon.png')
      : path.join(__dirname, '..', 'assets', 'darwin', 'icon.png')
  } else if (process.platform === 'win32') {
    iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'win32', 'icon.png')
      : path.join(__dirname, '..', 'assets', 'win32', 'icon.png')
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
    backgroundColor: '#1F2430',
    icon: iconPath && iconImage && !iconImage.isEmpty() ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'))

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function registerIPC() {
  ipcMain.on('get-app-path', (e) => {
    e.returnValue = app.getAppPath()
  })

  ipcMain.handle('app:getVersion', () => app.getVersion())

  ipcMain.handle('runtime:getConfig', async () => {
    const upgrade = runtimeConfig.upgrade
    let storage = getStorageDir()

    if (upgrade) {
      try {
        const pearStorageDir = await getPearRuntimeLegacyStorage(upgrade)
        if (pearStorageDir) {
          storage = pearStorageDir
        } else {
          const linkId = upgrade.replace(/^pear:\/\//, '')
          storage = path.join(storage, 'app-storage', 'by-dkey', linkId)
          logger.warn(
            'MAIN',
            'runtime:getConfig: legacy storage not found; using per-link Electron storage:',
            storage
          )
        }
      } catch (err) {
        const linkId = upgrade.replace(/^pear:\/\//, '')
        storage = path.join(storage, 'app-storage', 'by-dkey', linkId)
        logger.warn(
          'MAIN',
          'runtime:getConfig: failed to resolve legacy pear storage for upgrade link, using per-link Electron storage:',
          upgrade,
          err && err.message ? err.message : err,
          'storage=',
          storage
        )
      }
    }

    return {
      storage,
      key: runtimeConfig.upgrade || null,
      upgrade: runtimeConfig.upgrade,
      version: runtimeConfig.version,
      applink: runtimeConfig.upgrade || ''
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
    app.relaunch()
    app.exit(0)
  })

  ipcMain.handle(
    'runtime:checkUpdated',
    async () => !!(pearRuntime && pearRuntime.updated)
  )

  ipcMain.handle('vault:invoke', async (_event, { method, args }) => {
    if (!vaultClient) {
      throw new Error('Vault client not ready')
    }
    const fn = vaultClient[method]
    if (typeof fn !== 'function') {
      throw new Error(`Unknown vault method: ${method}`)
    }
    const rawArgs = args || []
    const deserialized = rawArgs.map((arg) => {
      if (arg && typeof arg === 'object' && arg.__base64) {
        return Buffer.from(arg.__base64, 'base64')
      }
      return arg
    })
    try {
      let result = await fn.apply(vaultClient, deserialized)
      if (Buffer.isBuffer(result)) {
        result = { __base64: result.toString('base64') }
      }
      return { ok: true, data: result }
    } catch (err) {
      return {
        ok: false,
        error: err.message || String(err),
        code: err.code
      }
    }
  })
}

app.whenReady().then(async () => {
  app.setName('PearPass')
  logger.setLogPath(app.getPath('userData'))
  registerIPC()
  try {
    await startRuntime()
  } catch (err) {
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
