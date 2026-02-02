/** @typedef {import('pear-interface')} */ /* global Pear */

import os from 'bare-os'
import { spawn } from 'bare-subprocess'
import { CLIPBOARD_CLEAR_TIMEOUT } from 'pearpass-lib-constants'

import { logger } from '../utils/logger'

// Get the text to monitor from command line args (passed by useCopyToClipboard)
const copiedValue = Pear.config.args[0] || ''

logger.log('Clipboard cleanup worker started')
logger.log(`Monitoring value: "${copiedValue.substring(0, 20)}..."`)

function getClipboardContent() {
  return new Promise((resolve) => {
    const platform = os.platform()
    let child

    if (platform === 'win32') {
      child = spawn('powershell', ['-command', 'Get-Clipboard -Raw'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      collectOutput(child, resolve)
    } else if (platform === 'darwin') {
      child = spawn('/usr/bin/pbpaste', [], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      collectOutput(child, resolve)
    } else if (platform === 'linux') {
      child = spawn('xsel', ['--clipboard', '--output'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      collectOutput(child, resolve, () => {
        const xclip = spawn('xclip', ['-selection', 'clipboard', '-o'], {
          stdio: ['pipe', 'pipe', 'pipe']
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
  child.on('exit', (code) => {
    if (code === 0) {
      resolve(data)
    } else if (onError) {
      onError()
    } else {
      resolve('')
    }
  })
  child.on('error', () => {
    if (onError) {
      onError()
    } else {
      resolve('')
    }
  })
  if (child.stdout.resume) child.stdout.resume()
}

function clearClipboard() {
  return new Promise((resolve) => {
    const platform = os.platform()

    if (platform === 'win32') {
      const child = spawn('cmd', ['/c', 'echo.|clip'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      child.on('exit', resolve)
      child.on('error', resolve)
    } else if (platform === 'darwin') {
      const child = spawn('/usr/bin/pbcopy', [], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      child.on('exit', resolve)
      child.on('error', resolve)
      child.stdin.end('')
    } else if (platform === 'linux') {
      const child = spawn('xsel', ['--clipboard', '--input'], {
        stdio: ['pipe', 'pipe', 'pipe']
      })
      let handled = false

      const done = () => {
        if (!handled) {
          handled = true
          resolve()
        }
      }

      child.on('error', () => {
        const xclip = spawn('xclip', ['-selection', 'clipboard'], {
          stdio: ['pipe', 'pipe', 'pipe']
        })
        xclip.on('exit', done)
        xclip.on('error', done)
        xclip.stdin.end('')
      })

      child.on('exit', done)
      child.stdin.end('')
    } else {
      resolve()
    }
  })
}

// Convert timeout from ms to seconds
const timeoutSeconds = Math.ceil(CLIPBOARD_CLEAR_TIMEOUT / 1000)

// Use a subprocess to keep the worker alive - setTimeout doesn't keep Bare's event loop running
const platform = os.platform()
let sleeper

if (platform === 'win32') {
  // Windows: use ping localhost with count to create delay
  sleeper = spawn('ping', ['-n', String(timeoutSeconds + 1), '127.0.0.1'], {
    stdio: ['pipe', 'pipe', 'pipe']
  })
} else {
  // macOS/Linux: use sleep command
  sleeper = spawn('/bin/sleep', [String(timeoutSeconds)], {
    stdio: ['pipe', 'pipe', 'pipe']
  })
}

sleeper.on('exit', async () => {
  logger.log('Clipboard cleanup timeout reached, checking...')

  try {
    const currentClipboard = await getClipboardContent()

    if (currentClipboard === copiedValue) {
      await clearClipboard()
      logger.log('Clipboard cleared successfully')
    } else {
      logger.log('Clipboard changed, skipping clear')
    }
  } catch (err) {
    logger.error('Clipboard cleanup error:', err.message)
  }

  Pear.exit(0)
})

sleeper.on('error', (err) => {
  logger.error('Clipboard cleanup sleeper error:', err.message)
  Pear.exit(1)
})
