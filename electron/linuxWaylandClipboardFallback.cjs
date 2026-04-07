const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const TEMP_WL_PASTE_NAME = 'pearpass-wl-paste'
const TEMP_WL_COPY_NAME = 'pearpass-wl-copy'

function getWlPasteBinaryArchitectureName() {
  return process.arch === 'arm64' ? 'wl-paste-arm64' : 'wl-paste-x86_64'
}

function getWlCopyBinaryArchitectureName() {
  return process.arch === 'arm64' ? 'wl-copy-arm64' : 'wl-copy-x86_64'
}

function resolveBundledBinarySourcePath(archName) {
  const packagedPath = path.join(__dirname, '..', '..', 'bin', archName)
  if (fs.existsSync(packagedPath)) return packagedPath

  const devPath = path.join(__dirname, '..', 'resources', 'bin', archName)
  if (fs.existsSync(devPath)) return devPath

  return null
}

function prepareBundledBinary(archName, tempName) {
  const sourcePath = resolveBundledBinarySourcePath(archName)

  if (!sourcePath) {
    process.stderr.write(
      `[linuxWaylandClipboardFallback] Bundled ${archName} binary not found in packaged or dev location.\n`
    )
    return null
  }

  const destPath = path.join(os.tmpdir(), tempName)

  try {
    fs.copyFileSync(sourcePath, destPath)
    fs.chmodSync(destPath, 0o755)
    return destPath
  } catch (err) {
    process.stderr.write(
      `[linuxWaylandClipboardFallback] Failed to extract bundled binary ${archName}: ${err && err.message ? err.message : err}\n`
    )
    return null
  }
}

function prepareWlPasteBinary() {
  return prepareBundledBinary(getWlPasteBinaryArchitectureName(), TEMP_WL_PASTE_NAME)
}

function prepareWlCopyBinary() {
  return prepareBundledBinary(getWlCopyBinaryArchitectureName(), TEMP_WL_COPY_NAME)
}

function readClipboardWithFallback() {
  const binaryPath = prepareWlPasteBinary()
  if (!binaryPath) return null

  const result = spawnSync(binaryPath, ['--no-newline'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  })

  if (result.error) {
    process.stderr.write(
      `[linuxWaylandClipboardFallback] Bundled wl-paste failed to start: ${result.error.message}\n`
    )
    return null
  }

  if (result.status === 0) return result.stdout || ''
  if (result.status === 1) return ''

  process.stderr.write(
    `[linuxWaylandClipboardFallback] Bundled wl-paste exited with unexpected status ${result.status}: ${result.stderr}\n`
  )
  return null
}

function clearClipboardWithFallback() {
  const binaryPath = prepareWlCopyBinary()
  if (!binaryPath) return false

  const clearResult = spawnSync(binaryPath, ['--clear'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  })

  if (!clearResult.error && clearResult.status === 0) return true

  if (clearResult.error) {
    process.stderr.write(
      `[linuxWaylandClipboardFallback] Bundled wl-copy --clear failed to start: ${clearResult.error.message}\n`
    )
  } else {
    process.stderr.write(
      `[linuxWaylandClipboardFallback] Bundled wl-copy --clear failed (status ${clearResult.status}), trying empty input fallback: ${clearResult.stderr}\n`
    )
  }

  const emptyResult = spawnSync(binaryPath, [], {
    encoding: 'utf8',
    input: '',
    stdio: ['pipe', 'pipe', 'pipe']
  })

  if (!emptyResult.error && emptyResult.status === 0) return true

  process.stderr.write(
    `[linuxWaylandClipboardFallback] Bundled wl-copy empty fallback also failed (status ${emptyResult.status}): ${emptyResult.stderr}\n`
  )
  return false
}

module.exports = {
  readClipboardWithFallback,
  clearClipboardWithFallback
}
