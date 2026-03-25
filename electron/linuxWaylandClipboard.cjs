const { spawnSync } = require('child_process')

function isWaylandSession() {
  return (
    Boolean(process.env.WAYLAND_DISPLAY) ||
    process.env.XDG_SESSION_TYPE === 'wayland'
  )
}

function runCommand(command, args, input) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe']
  })
}

function readClipboard() {
  const result = runCommand('wl-paste', ['--no-newline'], undefined)

  if (result.error) return null

  if (result.status === 0) return result.stdout || ''

  if (result.status === 1) return ''

  return null
}

function clearClipboard() {
  const clearResult = runCommand('wl-copy', ['--clear'], undefined)
  if (!clearResult.error && clearResult.status === 0) return true

  const emptyResult = runCommand('wl-copy', [], '')
  if (!emptyResult.error && emptyResult.status === 0) return true

  return false
}

module.exports = {
  clearClipboard,
  isWaylandSession,
  readClipboard
}
