/** @typedef {import('pear-interface')} */ /* global Pear */

import os from 'bare-os'
import { spawn } from 'bare-subprocess'
import { CLIPBOARD_CLEAR_TIMEOUT } from 'pearpass-lib-constants'

import { logger } from '../src/utils/logger'

// Get the text to monitor from command line args (passed by useCopyToClipboard)
// eslint-disable-next-line
const copiedValue = await getClipboardContent()

logger.log('Clipboard cleanup worker started')

export function getClipboardContent() {
  return new Promise((resolve) => {
    const platform = os.platform()
    let child

    switch (platform) {
      case 'win32':
        child = spawn('powershell', ['-command', 'Get-Clipboard -Raw'], {
          stdio: ['pipe', 'pipe', 'pipe']
        })
        collectOutput(child, resolve)
        break
      case 'darwin':
        child = spawn('/usr/bin/pbpaste', [], {
          stdio: ['pipe', 'pipe', 'pipe']
        })
        collectOutput(child, resolve)
        break
      case 'linux':
        const xsel = spawn('xsel', ['--clipboard', '--output'], {
          stdio: ['pipe', 'pipe', 'pipe']
        })

        collectOutput(
          xsel,
          resolve,
          () => {
            // Kill xsel if it's still around before fallback (prevents lingering procs)
            try {
              xsel.kill?.()
            } catch {}

            const xclip = spawn('xclip', ['-selection', 'clipboard', '-o'], {
              stdio: ['pipe', 'pipe', 'pipe']
            })

            collectOutput(xclip, resolve, () => resolve(''), {
              timeoutMs: 2000,
              maxBytes: 1024 * 1024
            })
          },
          { timeoutMs: 2000, maxBytes: 1024 * 1024 }
        )
        break
      default:
        resolve('')
        break
    }
  })
}

function collectOutput(child, resolve, onError, opts = {}) {
  const {
    timeoutMs = 2000,
    maxBytes = 1024 * 1024 // 1MB cap
  } = opts

  let data = ''
  let settled = false
  let timer = null

  const settle = (value) => {
    if (settled) return
    settled = true
    cleanup()
    resolve(value)
  }

  const fail = (info) => {
    if (settled) return
    settled = true
    cleanup()

    if (typeof onError === 'function') onError(info)
    else resolve('')
  }

  const cleanup = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    child.removeListener('exit', onExit)
    child.removeListener('error', onErr)

    if (child.stdout) {
      child.stdout.removeListener('data', onData)
      child.stdout.removeListener('error', onErr)
    }
  }

  const onData = (chunk) => {
    if (settled) return
    const s = chunk.toString()

    if (data.length + s.length > maxBytes) {
      data += s.slice(0, Math.max(0, maxBytes - data.length))
      try {
        child.kill?.()
      } catch {}
      settle(data)
      return
    }

    data += s
  }

  const onExit = (code) => {
    if (settled) return
    if (code === 0) settle(data)
    else fail({ type: 'exit', code })
  }

  const onErr = (err) => {
    if (settled) return
    fail({ type: 'error', err })
  }

  if (!child.stdout || !child.stdout.on) {
    fail({ type: 'nostdout' })
    return
  }

  child.stdout.on('data', onData)
  child.stdout.on('error', onErr)
  if (child.stdout.resume) child.stdout.resume()

  child.on('exit', onExit)
  child.on('error', onErr)

  if (timeoutMs > 0) {
    timer = setTimeout(() => {
      if (settled) return
      try {
        child.kill?.()
      } catch {}
      fail({ type: 'timeout' })
    }, timeoutMs)
  }
}

function clearClipboard() {
  return new Promise((resolve) => {
    const platform = os.platform()

    if (platform === 'win32') {
      const child = spawn('clip', { shell: true })
      child.stdin.end()
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

// Only run worker code if we have args (running as a worker, not imported for testing)
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

