/* global Pear */
import { spawn } from 'bare-subprocess'
import path from 'bare-path'
import fs from 'bare-fs'
import os from 'bare-os'

/**
 * Checks if a command is available in the system PATH
 */
function checkCommand(command) {
  return new Promise((resolve) => {
    const child = spawn('which', [command], {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    child.on('exit', (code) => resolve(code === 0))
    child.on('error', () => resolve(false))
  })
}

function getBundledXselPath() {
  // Convert file:// URL to filesystem path
  // Pear.config.applink is a file URL like "file:///home/harri/noxtton_forked/pearpass-app-desktop"
  let appPath = Pear.config.applink

  // Strip the file:// protocol if present
  if (appPath.startsWith('file://')) {
    appPath = appPath.slice(7) // Remove 'file://'
  }

  const bundledPath = path.join(appPath, 'resources', 'bin', 'xsel')

  try {
    if (fs.existsSync(bundledPath) && fs.statSync(bundledPath).isFile()) {
      return bundledPath
    }
  } catch (err) {
    // Ignore errors
  }
  return null
}

async function getClipboardTool() {
  if (os.platform() !== 'linux') {
    throw new Error('Not on Linux')
  }

  if (await checkCommand('xsel')) {
    return { command: 'xsel', readArgs: ['--clipboard', '--output'], writeArgs: ['--clipboard', '--input'] }
  }

  if (await checkCommand('xclip')) {
    return { command: 'xclip', readArgs: ['-selection', 'clipboard', '-o'], writeArgs: ['-selection', 'clipboard'] }
  }

  // Fall back to bundled xsel
  const bundledPath = getBundledXselPath()

  if (bundledPath) {
    console.log('Using bundled xsel:', bundledPath)
    return { command: bundledPath, readArgs: ['--clipboard', '--output'], writeArgs: ['--clipboard', '--input'] }
  }

  throw new Error('No clipboard tool available (xsel, xclip, or bundled binary)')
}

export async function readLinuxClipboard() {
  const { command, readArgs } = await getClipboardTool()
  return spawn(command, readArgs, { stdio: ['pipe', 'pipe', 'pipe'] })
}

export async function writeLinuxClipboard() {
  const { command, writeArgs } = await getClipboardTool()
  return spawn(command, writeArgs, { stdio: ['pipe', 'pipe', 'pipe'] })
}
