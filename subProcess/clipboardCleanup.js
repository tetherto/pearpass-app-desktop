/** @typedef {import('pear-interface')} */ /* global Pear */

import fs from 'bare-fs'
import os from 'bare-os'
import path from 'bare-path'
import { spawn, spawnSync } from 'bare-subprocess'
import { CLIPBOARD_CLEAR_TIMEOUT } from 'pearpass-lib-constants'

import { logger } from '../src/utils/logger'

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
      const child = spawn(
        'powershell',
        ['-command', 'Set-Clipboard -Value $null'],
        {
          stdio: ['pipe', 'pipe', 'pipe']
        }
      )
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

// Only run worker code when executed as a Pear subprocess, not when imported for testing
// Check for Pear.exit to ensure we're in the actual Pear runtime (not Jest)
if (typeof Pear !== 'undefined' && typeof Pear.exit === 'function') {
  ;(async () => {
    logger.log('Clipboard cleanup worker started')

    // Get the text to monitor from command line args (passed by useCopyToClipboard)
    const copiedValue = await getClipboardContent()

    // Only run worker code if we have args (running as a worker, not imported for testing)
    // Convert timeout from ms to seconds
    const timeoutSeconds = Math.ceil(CLIPBOARD_CLEAR_TIMEOUT / 1000)

    // Use a subprocess to keep the worker alive - setTimeout doesn't keep Bare's event loop running
    const platform = os.platform()

    if (platform === 'win32') {
      // Windows: write a PowerShell script to temp and run it via cmd start.
      // The script file approach avoids command line escaping issues.
      const base64Value = Buffer.from(copiedValue).toString('base64')
      const scriptId = Date.now()
      const tempDir = os.tmpdir()
      const scriptPath = path.join(tempDir, `pearpass_clip_${scriptId}.ps1`)

      // PowerShell script content - sleeps, checks clipboard, clears if unchanged, deletes itself
      const scriptContent = `
Start-Sleep -Seconds ${timeoutSeconds}
$v = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${base64Value}'))
$c = Get-Clipboard -Raw
if ($c.Trim() -eq $v.Trim()) {
  Set-Clipboard -Value $null
}
Remove-Item -Path '${scriptPath.replace(/\\/g, '\\\\')}' -Force -ErrorAction SilentlyContinue
`

      // Write the script file synchronously
      fs.writeFileSync(scriptPath, scriptContent)
      logger.log(`Windows clipboard cleanup script written`)

      // Run the script via cmd start (creates independent process)
      // Using start without /b to create truly detached process (may briefly flash)
      const result = spawnSync('cmd', [
        '/c',
        'start',
        '""',
        '/min',
        'powershell',
        '-WindowStyle',
        'Hidden',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        scriptPath
      ])

      logger.log(
        `Windows clipboard cleanup started, exit code: ${result.status}`
      )
      Pear.exit(0)
    } else {
      // macOS/Linux: use sleep command - these platforms handle process groups differently
      // and the worker survives long enough after app close for cleanup to complete
      const sleeper = spawn('/bin/sleep', [String(timeoutSeconds)], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

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
    }
  })()
}
