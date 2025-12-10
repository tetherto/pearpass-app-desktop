/** @typedef {import('pear-interface')} */ /* global Pear */

import os from 'bare-os'
import { spawn } from 'bare-subprocess'
import { CLIPBOARD_CLEAR_TIMEOUT } from 'pearpass-lib-constants'

import { logger } from '../utils/logger'

const pipe = Pear.worker.pipe()

let copiedValue = ''

pipe.on('data', async (buffer) => {
  copiedValue = buffer.toString('utf8')

  logger.log('Received message clipboard')
})

export function getClipboardContent() {
  return new Promise((resolve) => {
    const platform = os.platform()
    let child

    if (platform === 'win32') {
      child = spawn('powershell', ['-command', 'Get-Clipboard -Raw'], {
        shell: true
      })
      collectOutput(child, resolve)
    } else if (platform === 'darwin') {
      child = spawn('pbpaste', { shell: true })
      collectOutput(child, resolve)
    } else if (platform === 'linux') {
      child = spawn('xsel', ['--clipboard', '--output'], { shell: true })
      collectOutput(child, resolve, () => {
        const xclip = spawn('xclip', ['-selection', 'clipboard', '-o'], {
          shell: true
        })
        collectOutput(xclip, resolve)
      })
    } else {
      resolve('')
    }
  })
}

function collectOutput(child, resolve, onError) {
  let data = ''
  child.stdout.on('data', (chunk) => {
    data += chunk.toString()
  })
  child.on('exit', () => {
    resolve(data)
  })
  child.on('error', () => {
    if (onError) {
      onError()
    } else {
      resolve('')
    }
  })
}

function clearClipboard() {
  return new Promise((resolve) => {
    const platform = os.platform()

    if (platform === 'win32') {
      // Windows: clip command
      const child = spawn('clip', { shell: true })
      child.on('exit', resolve)
      child.on('error', resolve)
      child.stdin.end() // Sending empty input clears it
    } else if (platform === 'darwin') {
      // macOS: pbcopy command
      const child = spawn('pbcopy', { shell: true })
      child.on('exit', resolve)
      child.on('error', resolve)
      child.stdin.end()
    } else if (platform === 'linux') {
      // Linux: xsel or xclip (try xsel first, fallback to xclip)
      // Note: This assumes one of these is installed, which is standard on most distros
      const child = spawn('xsel', ['--clipboard', '--input'], { shell: true })
      let handled = false

      const done = () => {
        if (!handled) {
          handled = true
          resolve()
        }
      }

      child.on('error', () => {
        const xclip = spawn('xclip', ['-selection', 'clipboard'], {
          shell: true
        })
        xclip.on('exit', done)
        xclip.on('error', done)
        xclip.stdin.end()
      })

      child.on('exit', done)
      child.stdin.end()
    } else {
      resolve()
    }
  })
}

setTimeout(async () => {
  const currentClipboard = await getClipboardContent()

  if (currentClipboard === copiedValue) {
    await clearClipboard()
    logger.log('Clipboard cleared')
  }

  Pear.exit(0)
  logger.log('Clipboard cleanup worker exited')
}, CLIPBOARD_CLEAR_TIMEOUT)

pipe.on('end', async () => {
  Pear.exit(0)
  logger.log('Clipboard cleanup worker pipe ended')
})
