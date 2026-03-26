#!/usr/bin/env node
/**
 * Electron-builder afterPack hook for Linux:
 *
 * 1. Remove chrome-sandbox — squashfs (AppImage) cannot preserve SUID bits,
 *    so Chromium's setuid sandbox probe crashes before Node.js even starts.
 *
 * 2. Wrap the real Electron binary with a shell script that passes --no-sandbox.
 *    app.commandLine.appendSwitch('no-sandbox') in main.cjs is too late —
 *    Chromium's zygote sandbox decision happens before Node.js initializes.
 *    The wrapper ensures --no-sandbox reaches Chromium at process start.
 */
const fs = require('fs')
const path = require('path')

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return

  const appOutDir = context.appOutDir

  // 1. Remove chrome-sandbox (cannot work inside squashfs / AppImage)
  const sandboxBin = path.join(appOutDir, 'chrome-sandbox')
  if (fs.existsSync(sandboxBin)) {
    fs.unlinkSync(sandboxBin)
    console.log(`afterPack: removed ${sandboxBin}`)
  }

  // 2. Wrap the real binary so --no-sandbox is on the command line
  //    before Chromium's early startup
  const execName = context.packager.executableName
  const realBin = path.join(appOutDir, execName)
  const renamedBin = path.join(appOutDir, `${execName}.bin`)

  if (!fs.existsSync(realBin)) {
    console.warn(`afterPack: executable not found at ${realBin}, skipping wrapper`)
    return
  }

  fs.renameSync(realBin, renamedBin)

  const wrapper = [
    '#!/bin/bash',
    `exec "$(dirname "$(readlink -f "$0")")/${execName}.bin" --no-sandbox "$@"`,
    ''
  ].join('\n')

  fs.writeFileSync(realBin, wrapper, { mode: 0o755 })
  console.log(`afterPack: created --no-sandbox wrapper for ${execName}`)
}
