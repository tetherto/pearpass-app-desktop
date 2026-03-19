const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const DEFAULT_CLIPBOARD_CLEAR_DELAY_MS = 30000
const CLIPBOARD_CLEANUP_STATE_FILE = 'pearpass-clipboard-cleanup-current.token'

function getClipboardCleanupStatePath(app) {
  return path.join(app.getPath('temp'), CLIPBOARD_CLEANUP_STATE_FILE)
}

function removeFileIfExists(filePath) {
  try {
    fs.unlinkSync(filePath)
  } catch (err) {
    if (err && err.code !== 'ENOENT') throw err
  }
}

function removeClipboardCleanupTokenIfCurrent(statePath, token) {
  try {
    const currentToken = fs.readFileSync(statePath, 'utf8')
    if (currentToken === token) {
      removeFileIfExists(statePath)
    }
  } catch (err) {
    if (err && err.code !== 'ENOENT') throw err
  }
}

function spawnDetachedClipboardHelper(secretPath, token, statePath, delayMs) {
  const helperPath = path.join(__dirname, 'clipboardCleanupHelper.cjs')
  if (!fs.existsSync(helperPath)) {
    throw new Error(`Clipboard cleanup helper not found: ${helperPath}`)
  }

  const child = spawn(
    process.execPath,
    [helperPath, secretPath, token, statePath, String(delayMs)],
    {
      detached: true,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'ignore',
      windowsHide: true
    }
  )

  child.unref()
}

function spawnDetachedWindowsClipboardHelper(
  secretPath,
  token,
  statePath,
  delayMs
) {
  const scriptPath = path.join(__dirname, 'clipboardCleanup.windows.ps1')
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Windows clipboard cleanup script not found: ${scriptPath}`)
  }

  const child = spawn(
    'cmd.exe',
    [
      '/c',
      'start',
      '""',
      '/min',
      'powershell.exe',
      '-NoProfile',
      '-WindowStyle',
      'Hidden',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      '-SecretPath',
      secretPath,
      '-StatePath',
      statePath,
      '-Token',
      token,
      '-DelayMs',
      String(delayMs)
    ],
    {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    }
  )

  child.unref()
}

function scheduleClipboardCleanup({ app, clipboard, logger, isWindows, text, delayMs }) {
  const finalDelayMs =
    Number.isFinite(delayMs) && delayMs > 0
      ? delayMs
      : DEFAULT_CLIPBOARD_CLEAR_DELAY_MS
  const textToMatch = typeof text === 'string' ? text : clipboard.readText()

  if (typeof textToMatch !== 'string' || textToMatch.length === 0) {
    return false
  }

  const token = crypto.randomUUID()
  const statePath = getClipboardCleanupStatePath(app)
  const secretPath = path.join(
    app.getPath('temp'),
    `pearpass-clipboard-secret-${token}.txt`
  )

  try {
    fs.writeFileSync(secretPath, textToMatch, { encoding: 'utf8', mode: 0o600 })
    fs.writeFileSync(statePath, token, { encoding: 'utf8', mode: 0o600 })

    if (isWindows) {
      spawnDetachedWindowsClipboardHelper(
        secretPath,
        token,
        statePath,
        finalDelayMs
      )
    } else {
      spawnDetachedClipboardHelper(secretPath, token, statePath, finalDelayMs)
    }

    return true
  } catch (err) {
    try {
      removeFileIfExists(secretPath)
      removeClipboardCleanupTokenIfCurrent(statePath, token)
    } catch (_) {}

    logger.warn(
      'MAIN',
      'Failed to schedule detached clipboard cleanup:',
      err && err.message ? err.message : err
    )
    return false
  }
}

module.exports = {
  scheduleClipboardCleanup
}
