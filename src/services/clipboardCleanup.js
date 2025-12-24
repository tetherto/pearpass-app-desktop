/** @typedef {import('pear-interface')} */ /* global Pear */

import { Buffer } from 'buffer'

import { spawn as spawnDaemon } from 'bare-daemon'
import os from 'bare-os'
import { spawn } from 'bare-subprocess'
import { CLIPBOARD_CLEAR_TIMEOUT } from 'pearpass-lib-constants'
import sodium from 'sodium-native'

import { logger } from '../utils/logger'

const pipe = Pear.worker.pipe()

pipe.on('data', (buffer) => {
  const sodiumBuf = sodium.sodium_malloc(buffer.length)
  buffer.copy(sodiumBuf)
  const copiedValue = sodiumBuf.toString('utf8')

  logger.log('Received message clipboard')

  try {
    startClipboardClearDaemon(copiedValue)
  } catch (err) {
    logger.error(
      'clipboardCleanup',
      'Failed to start clipboard cleanup daemon',
      err
    )
  } finally {
    // Best-effort wipe of sensitive data from memory
    try {
      sodium.sodium_memzero(sodiumBuf)
    } catch {}
    try {
      sodium.sodium_memzero(buffer)
    } catch {}

    Pear.exit(0)
    logger.log('Clipboard cleanup worker exited after starting daemon')
  }
})

pipe.on('end', () => {
  Pear.exit(0)
  logger.log('Clipboard cleanup worker pipe ended')
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

function startClipboardClearDaemon(copiedValue) {
  const platform = os.platform()
  const timeoutMs = CLIPBOARD_CLEAR_TIMEOUT
  const timeoutSeconds = Math.ceil(timeoutMs / 1000)
  const expectedBase64 = deriveExpectedBase64(copiedValue)

  if (platform === 'win32') {
    spawnWindowsClipboardDaemon(timeoutMs, expectedBase64)
    return
  }

  if (platform === 'darwin') {
    spawnMacClipboardDaemon(timeoutSeconds, copiedValue)
    return
  }

  if (platform === 'linux') {
    spawnLinuxClipboardDaemon(timeoutSeconds, expectedBase64)
  }
}

function deriveExpectedBase64(copiedValue) {
  let copiedBuf = null
  try {
    const len = Buffer.byteLength(copiedValue, 'utf8')
    copiedBuf = sodium.sodium_malloc(len)
    copiedBuf.write(copiedValue, 'utf8')
    return copiedBuf.toString('base64')
  } finally {
    if (copiedBuf) {
      try {
        sodium.sodium_memzero(copiedBuf)
      } catch {}
    }
  }
}

function spawnWindowsClipboardDaemon(timeoutMs, expectedBase64) {
  const psScript = [
    `$expected = "${expectedBase64}"`,
    `Start-Sleep -Milliseconds ${timeoutMs}`,
    'try {',
    '  $clipboard = Get-Clipboard -Raw',
    '} catch {',
    '  $clipboard = $null',
    '}',
    'if ($clipboard -ne $null) {',
    '  $bytes = [System.Text.Encoding]::UTF8.GetBytes($clipboard)',
    '  $current = [Convert]::ToBase64String($bytes)',
    '  if ($current -eq $expected) {',
    '    Set-Clipboard -Value "" | Out-Null',
    '  }',
    '}'
  ].join('; ')

  spawnDaemon('powershell', [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    psScript
  ])
}

function spawnMacClipboardDaemon(timeoutSeconds, copiedValue) {
  // macOS: use JXA (JavaScript for Automation) via osascript so the helper
  // can access the user's system clipboard even when detached from the app.
  const jxaScript = `
function run(argv) {
  var delaySeconds = parseFloat(argv[0]);
  var expected = argv[1] || "";
  delay(delaySeconds);
  var app = Application.currentApplication();
  app.includeStandardAdditions = true;
  var current = app.theClipboard() || "";
  if (!current || current === expected) {
    app.setTheClipboardTo("");
  }
}
`.trim()

  spawnDaemon('/usr/bin/osascript', [
    '-l',
    'JavaScript',
    '-e',
    jxaScript,
    String(timeoutSeconds),
    copiedValue
  ])
}

function spawnLinuxClipboardDaemon(timeoutSeconds, expectedBase64) {
  const shScript = [
    `sleep ${timeoutSeconds}`,
    `expected="${expectedBase64}"`,
    'if command -v xsel >/dev/null 2>&1; then',
    '  current=$(xsel --clipboard --output 2>/dev/null | base64 2>/dev/null || printf "")',
    '  if [ "$current" = "$expected" ]; then',
    '    printf "" | xsel --clipboard --input',
    '  fi',
    'elif command -v xclip >/dev/null 2>&1; then',
    '  current=$(xclip -selection clipboard -o 2>/dev/null | base64 2>/dev/null || printf "")',
    '  if [ "$current" = "$expected" ]; then',
    '    printf "" | xclip -selection clipboard',
    '  fi',
    'fi'
  ].join('; ')

  spawnDaemon('/bin/sh', ['-lc', shScript])
}
