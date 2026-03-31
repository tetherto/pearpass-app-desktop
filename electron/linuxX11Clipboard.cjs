const { spawnSync } = require('child_process')

const {
  readClipboardWithFallback,
  clearClipboardWithFallback
} = require('./linuxX11ClipboardFallback.cjs')

function runCommand(command, args, input) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe']
  })
}

function readClipboard() {
  const commands = [
    ['xsel', ['--clipboard', '--output']],
    ['xclip', ['-selection', 'clipboard', '-o']]
  ]

  for (const [command, args] of commands) {
    const result = runCommand(command, args, undefined)
    if (!result.error && result.status === 0) {
      return result.stdout || ''
    }
  }

  return readClipboardWithFallback()
}

function clearClipboard() {
  const commands = [
    ['xsel', ['--clipboard', '--input']],
    ['xclip', ['-selection', 'clipboard']]
  ]

  for (const [command, args] of commands) {
    const result = runCommand(command, args, '')
    if (!result.error && result.status === 0) {
      return true
    }
  }

  return clearClipboardWithFallback()
}

module.exports = {
  clearClipboard,
  readClipboard
}
