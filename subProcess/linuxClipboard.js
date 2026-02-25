/* global Pear */
import { spawn } from 'bare-subprocess'
import path from 'bare-path'
import fs from 'bare-fs/promises'
import bareFs from 'bare-fs'
import AppDrive from 'pear-appdrive'

const STDIO = { stdio: ['pipe', 'pipe', 'pipe'] }

const BUNDLED_BIN_DIR = 'resources/bin'

// Uses `which` to verify the command exists as a system binary.
function checkSystemCommand(command) {
  return new Promise((resolve) => {
    const child = spawn('which', [command], STDIO)
    child.on('exit', (code) => resolve(code === 0))
    child.on('error', () => resolve(false))
  })
}

// Returns file info and whether binary is executable, prints info, resolves true/false
function checkBinaryAtPath(binaryPath) {
  return new Promise((resolve) => {
    try {
      const stat = bareFs.statSync(binaryPath)
      const isExec = !!(stat.mode & 0o111)
      resolve(isExec)
    } catch (err) {
      resolve(false)
    }
  })
}

// Gets-or-creates the storage path for a bundled binary.
// Accepts only the binary name (e.g. 'xsel').
// The source path on the drive and the storage directory are derived from BUNDLED_BIN_DIR.
async function getBinStoragePath(binaryName) {
  const packagedBinPath = path.join(BUNDLED_BIN_DIR, binaryName)
  const binDir = path.join(Pear.app.storage, BUNDLED_BIN_DIR)
  const binaryStoragePath = path.join(binDir, binaryName)

  await fs.mkdir(binDir, { recursive: true })

  if (await checkBinaryAtPath(binaryStoragePath)) return binaryStoragePath

  const drive = new AppDrive()
  await drive.ready()

  const content = await drive.get(packagedBinPath)

  if (!content?.length) {
    await drive.close()
    throw new Error(
      `drive.get('${packagedBinPath}') returned empty/null.\n` +
      `Ensure 'resources' is in pear.stage.includes and re-run 'pear stage dev'.`
    )
  }

  await fs.writeFile(binaryStoragePath, content)
  await fs.chmod(binaryStoragePath, 0o755)
  await drive.close()

  return binaryStoragePath
}

export async function readLinuxClipboard() {
  if (await checkSystemCommand('xsel')) {
    return spawn('xsel', ['--clipboard', '--output'], STDIO)
  }

  if (await checkSystemCommand('xclip')) {
    return spawn('xclip', ['-selection', 'clipboard', '-o'], STDIO)
  }

  const bundledPath = await getBinStoragePath('xsel')
  return spawn(bundledPath, ['--clipboard', '--output'], STDIO)
}

export async function writeLinuxClipboard() {
  if (await checkSystemCommand('xsel')) {
    return spawn('xsel', ['--clipboard', '--input'], STDIO)
  }

  if (await checkSystemCommand('xclip')) {
    return spawn('xclip', ['-selection', 'clipboard'], STDIO)
  }

  const bundledPath = await getBinStoragePath('xsel')
  return spawn(bundledPath, ['--clipboard', '--input'], STDIO)
}
