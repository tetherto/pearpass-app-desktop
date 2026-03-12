#!/usr/bin/env node

import fs from 'node:fs'
import { execSync, spawnSync } from 'node:child_process'
import pkg from '../package.json'
function run(command) {
  execSync(command, { stdio: 'inherit', shell: true })
}

function removeDirIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) return

  for (let i = 0; i < 2; i += 1) {
    try {
      fs.rmSync(targetPath, { recursive: true, force: true })
      if (!fs.existsSync(targetPath)) return
    } catch {
      // Retry once after a short delay for transient Windows file locks.
    }
    if (i === 0) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500)
    }
  }

  if (fs.existsSync(targetPath)) {
    throw new Error(`Failed to remove directory: ${targetPath}`)
  }
}

function stopPearPassProcess() {
  if (process.platform !== 'win32') return

  spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      'Stop-Process -Name PearPass -Force -ErrorAction SilentlyContinue'
    ],
    { stdio: 'inherit' }
  )
}

function main() {
  if (process.platform !== 'win32') {
    throw new Error('dist.win.mjs must be run on Windows')
  }

  run('npm install --include=optional')
  run('npm install --no-save @esbuild/win32-x64@0.24.2')
  run('npm run build')
  run('npm prune --omit=dev')
  run('npm install electron --no-save')

  stopPearPassProcess()
  removeDirIfExists('dist/win-unpacked')

  run('npx electron-builder --win --dir')

  const outRoot = 'out/win32-x64/pearpass-app-desktop'
  removeDirIfExists(outRoot)
  fs.mkdirSync(outRoot, { recursive: true })
  fs.cpSync('dist/win-unpacked', outRoot, { recursive: true })

  run('npm install')
  run('npm run pear:build:win')
}

main()
