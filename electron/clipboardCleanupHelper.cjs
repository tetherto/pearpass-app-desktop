const { spawnSync } = require('child_process')
const fs = require('fs')

const {
  readClipboardWithFallback,
  clearClipboardWithFallback
} = require('./linuxClipboardFallback.cjs')

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

function logLinuxClipboardSkip() {
  process.stderr.write(
    'PearPass clipboard cleanup skipped: Linux clipboard command unavailable or failed.\n'
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
    const commands = [
      ['xsel', ['--clipboard', '--output']],
      ['xclip', ['-selection', 'clipboard', '-o']]
    ]

    for (const [command, args] of commands) {
      const result = runClipboardCommand(command, args, undefined)
      if (!result.error && result.status === 0) {
        return result.stdout || ''
      }
    }

    // Neither xsel nor xclip found as system commands — try bundled binary
    const fallbackResult = readClipboardWithFallback()
    if (typeof fallbackResult === 'string') return fallbackResult

    logLinuxClipboardSkip()
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
    const commands = [
      ['xsel', ['--clipboard', '--input']],
      ['xclip', ['-selection', 'clipboard']]
    ]

    for (const [command, args] of commands) {
      const result = runClipboardCommand(command, args, '')
      if (!result.error && result.status === 0) {
        return
      }
    }

    // Neither xsel nor xclip found as system commands — try bundled binary
    if (clearClipboardWithFallback()) return

    logLinuxClipboardSkip()
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

      readClipboard()
    } else {
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
