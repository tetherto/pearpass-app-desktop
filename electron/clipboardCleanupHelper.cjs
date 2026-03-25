const { spawnSync } = require('child_process')
const fs = require('fs')

const linuxWaylandClipboard = require('./linuxWaylandClipboard.cjs')
const linuxX11Clipboard = require('./linuxX11Clipboard.cjs')

function removeFileIfExists(filePath) {
  try {
    fs.unlinkSync(filePath)
  } catch (err) {
    if (err && err.code !== 'ENOENT') throw err
  }
}

function readSecretFromFile(secretPath) {
  try {
    return fs.readFileSync(secretPath, 'utf8')
  } finally {
    removeFileIfExists(secretPath)
  }
}

function readCurrentToken(statePath) {
  try {
    return fs.readFileSync(statePath, 'utf8')
  } catch (err) {
    if (err && err.code === 'ENOENT') return ''
    throw err
  }
}

function clearCurrentTokenIfMatches(statePath, token) {
  if (readCurrentToken(statePath) === token) {
    removeFileIfExists(statePath)
  }
}

function describeLinuxSession() {
  const waylandDisplay = process.env.WAYLAND_DISPLAY || ''
  const sessionType = process.env.XDG_SESSION_TYPE || ''
  const display = process.env.DISPLAY || ''
  return `WAYLAND_DISPLAY=${waylandDisplay || '(unset)'} XDG_SESSION_TYPE=${sessionType || '(unset)'} DISPLAY=${display || '(unset)'}`
}

function logLinuxClipboardSkip(sessionLabel) {
  process.stderr.write(
    `PearPass clipboard cleanup skipped: ${sessionLabel} clipboard command unavailable or failed. (${describeLinuxSession()})\n`
  )
}

function sleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

function runClipboardCommand(command, args, input) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe']
  })
}

function readClipboard() {
  if (process.platform === 'darwin') {
    const result = runClipboardCommand('/usr/bin/pbpaste', [], undefined)
    if (result.error || result.status !== 0) {
      throw result.error || new Error('pbpaste failed')
    }
    return result.stdout || ''
  }

  if (process.platform === 'linux') {
    const isWayland = linuxWaylandClipboard.isWaylandSession()
    const linuxClipboard = isWayland ? linuxWaylandClipboard : linuxX11Clipboard
    const sessionLabel = isWayland ? 'Wayland' : 'X11'

    const result = linuxClipboard.readClipboard()
    if (typeof result === 'string') return result

    logLinuxClipboardSkip(sessionLabel)
    return null
  }

  throw new Error(`Unsupported platform: ${process.platform}`)
}

function clearClipboard() {
  if (process.platform === 'darwin') {
    const result = runClipboardCommand('/usr/bin/pbcopy', [], '')
    if (result.error || result.status !== 0) {
      throw result.error || new Error('pbcopy failed')
    }
    return
  }

  if (process.platform === 'linux') {
    const isWayland = linuxWaylandClipboard.isWaylandSession()
    const linuxClipboard = isWayland ? linuxWaylandClipboard : linuxX11Clipboard
    const sessionLabel = isWayland ? 'Wayland' : 'X11'

    if (linuxClipboard.clearClipboard()) return

    logLinuxClipboardSkip(sessionLabel)
    return
  }

  throw new Error(`Unsupported platform: ${process.platform}`)
}

async function runClipboardCleanup({
  secretPath,
  token,
  statePath,
  delayMs = 30000
}) {
  const expectedText = readSecretFromFile(secretPath)

  await sleep(delayMs)

  if (readCurrentToken(statePath) !== token) {
    return false
  }

  try {
    const clipboardText = readClipboard()

    if (typeof clipboardText !== 'string') {
      return false
    }

    if (clipboardText === expectedText) {
      clearClipboard()
    }

    return true
  } finally {
    clearCurrentTokenIfMatches(statePath, token)
  }
}

async function main(argv = process.argv) {
  const [, , secretPath, token, statePath, delayMsArg] = argv
  const delayMs = Number.parseInt(delayMsArg, 10)

  if (!secretPath || !token || !statePath) {
    process.exitCode = 1
    return
  }

  try {
    await runClipboardCleanup({
      secretPath,
      token,
      statePath,
      delayMs: Number.isFinite(delayMs) && delayMs > 0 ? delayMs : 30000
    })
  } catch (err) {
    process.stderr.write(
      `PearPass clipboard cleanup failed: ${err && err.message ? err.message : err}\n`
    )
    process.exitCode = 1
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  clearClipboard,
  clearCurrentTokenIfMatches,
  logLinuxClipboardSkip,
  main,
  readClipboard,
  readCurrentToken,
  readSecretFromFile,
  runClipboardCleanup,
  sleep
}
