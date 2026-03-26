const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const TEMP_BINARY_NAME = 'pearpass-xsel'

/**
 * Returns the architecture-specific bundled xsel binary filename.
 * @returns {'xsel-arm64' | 'xsel-x86_64'}
 */
function getBinaryArchitectureName() {
  return process.arch === 'arm64' ? 'xsel-arm64' : 'xsel-x86_64'
}

/**
 * Resolves the bundled xsel binary source path purely from __dirname.
 * No arguments needed — this file always knows where it lives on disk.
 *
 * Packaged Electron app structure:
 *   resources/app/electron/linuxClipboardFallback.cjs  ← __dirname
 *   resources/bin/xsel-x86_64                          ← extraResources (to: "bin")
 *   → path.join(__dirname, '..', '..', 'bin', archName)
 *
 * Dev structure:
 *   <project>/electron/linuxClipboardFallback.cjs  ← __dirname
 *   <project>/resources/bin/xsel-x86_64
 *   → path.join(__dirname, '..', 'resources', 'bin', archName)
 *
 * @returns {string | null} Absolute path to the binary, or null if not found in either location
 */
function resolveBundledBinarySourcePath() {
  const archName = getBinaryArchitectureName()

  // Packaged: resources/app/electron/ → ../../bin/
  const packagedPath = path.join(__dirname, '..', '..', 'bin', archName)
  if (fs.existsSync(packagedPath)) return packagedPath

  // Dev: <project>/electron/ → ../resources/bin/
  const devPath = path.join(__dirname, '..', 'resources', 'bin', archName)
  if (fs.existsSync(devPath)) return devPath

  return null
}

/**
 * Extracts the bundled xsel binary to a temp location and ensures it is
 * executable. Returns the path to the extracted binary, or null if the
 * source binary is not found in any known location.
 *
 * @returns {string | null}
 */
function prepareBundledBinary() {
  const sourcePath = resolveBundledBinarySourcePath()

  if (!sourcePath) {
    process.stderr.write(
      '[linuxClipboardFallback] Bundled xsel binary not found in packaged or dev location.\n'
    )
    return null
  }

  const destPath = path.join(os.tmpdir(), TEMP_BINARY_NAME)

  try {
    fs.copyFileSync(sourcePath, destPath)
    fs.chmodSync(destPath, 0o755)
    return destPath
  } catch (err) {
    process.stderr.write(
      `[linuxClipboardFallback] Failed to extract bundled binary: ${err && err.message ? err.message : err}\n`
    )
    return null
  }
}

/**
 * Reads the clipboard content using the bundled xsel binary.
 * Returns the clipboard text, or null if the fallback is unavailable or fails.
 *
 * @returns {string | null}
 */
function readClipboardWithFallback() {
  const binaryPath = prepareBundledBinary()
  if (!binaryPath) return null

  const result = spawnSync(binaryPath, ['--clipboard', '--output'], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  })

  if (!result.error && result.status === 0) {
    return result.stdout || ''
  }

  process.stderr.write(
    `[linuxClipboardFallback] Bundled xsel read failed. status=${result.status}, error=${result.error}\n`
  )
  return null
}

/**
 * Clears the clipboard using the bundled xsel binary.
 * Returns true on success, false if the fallback is unavailable or fails.
 *
 * @returns {boolean}
 */
function clearClipboardWithFallback() {
  const binaryPath = prepareBundledBinary()
  if (!binaryPath) return false

  const result = spawnSync(binaryPath, ['--clipboard', '--input'], {
    encoding: 'utf8',
    input: '',
    stdio: ['pipe', 'pipe', 'pipe']
  })

  if (!result.error && result.status === 0) {
    return true
  }

  process.stderr.write(
    `[linuxClipboardFallback] Bundled xsel clear failed. status=${result.status}, error=${result.error}\n`
  )
  return false
}

module.exports = {
  readClipboardWithFallback,
  clearClipboardWithFallback
}
