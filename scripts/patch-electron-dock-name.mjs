#!/usr/bin/env node
/* eslint-disable no-underscore-dangle */
/**
 * On macOS, make the dock show "PearPass" when running `electron .` in development.
 * The dock uses the .app bundle *folder name*, not Info.plist. So we:
 * 1. Rename Electron.app -> PearPass.app
 * 2. Update electron's path.txt so it launches PearPass.app
 * 3. Patch Info.plist in the renamed bundle and clear quarantine (avoid translocation)
 * Run automatically after npm install (postinstall) on darwin only.
 */
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'node_modules', 'electron', 'dist')
const electronApp = path.join(dist, 'Electron.app')
const pathTxt = path.join(root, 'node_modules', 'electron', 'path.txt')

if (process.platform !== 'darwin') {
  process.exit(0)
}

let appName = 'PearPass'
try {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8')
  )
  appName = pkg.build?.productName || pkg.productName || appName
} catch {
  // keep default
}

// Sanitize for folder name (no slashes)
const appFolderName = `${appName}.app`
const renamedApp = path.join(dist, appFolderName)

if (!fs.existsSync(electronApp)) {
  // Already patched (renamed) or electron not installed
  if (fs.existsSync(renamedApp)) {
    process.exit(0)
  }
  process.exit(0)
}

try {
  // 1. Rename Electron.app -> PearPass.app (dock uses .app folder name)
  fs.renameSync(electronApp, renamedApp)
  console.log(
    `[patch-electron-dock-name] Renamed Electron.app -> ${appFolderName}`
  )

  // 2. Update path.txt so "electron" CLI launches the renamed app (binary inside is still "Electron")
  const macPath = `${appFolderName}/Contents/MacOS/Electron`
  fs.writeFileSync(pathTxt, macPath, 'utf8')
  console.log(`[patch-electron-dock-name] Updated path.txt to ${macPath}`)

  // 3. Patch Info.plist in the renamed bundle
  const plistPath = path.join(renamedApp, 'Contents', 'Info.plist')
  const PlistBuddy = '/usr/libexec/PlistBuddy'
  execSync(`"${PlistBuddy}" -c "Set :CFBundleName ${appName}" "${plistPath}"`, {
    stdio: 'inherit'
  })
  execSync(
    `"${PlistBuddy}" -c "Set :CFBundleDisplayName ${appName}" "${plistPath}"`,
    { stdio: 'inherit' }
  )

  // 4. Clear quarantine so macOS doesn't translocate (run from copy with old name)
  execSync(`xattr -cr "${renamedApp}"`, { stdio: 'ignore' })
  console.log(
    `[patch-electron-dock-name] Dock will show "${appName}". Quit the app and run again.`
  )
} catch (err) {
  console.warn('[patch-electron-dock-name] Failed:', err.message)
  process.exit(1)
}
