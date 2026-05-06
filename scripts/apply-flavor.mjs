#!/usr/bin/env node
/**
 * Apply build-flavor branding to the working tree. CI-only: mutates icon
 * files and config files in place when PEARPASS_FLAVOR=nightly.
 *
 * Swaps nightly icons over the stable paths, rewrites productName/appId in
 * package.json + electron-builder configs, and patches the Windows MSIX
 * AppxManifest.xml identity + display names. No-op for any other flavor.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const flavor = process.env.PEARPASS_FLAVOR || 'release'
if (flavor === 'release') {
  process.exit(0)
}
if (flavor !== 'nightly') {
  console.error(`[apply-flavor] Unknown PEARPASS_FLAVOR="${flavor}"`)
  process.exit(1)
}

const STABLE_NAME = 'PearPass'
const NIGHTLY_NAME = 'PearPass-nightly'
const STABLE_APP_ID = 'com.pears.pass'
const NIGHTLY_APP_ID = 'com.pears.pass.nightly'
const MSIX_STABLE_IDENTITY = 'PearPass'
const MSIX_NIGHTLY_IDENTITY = 'PearPass-Nightly'

const iconSwaps = [
  ['assets/darwin/icon-nightly.png', 'assets/darwin/icon.png'],
  ['assets/linux/icon-nightly.png', 'assets/linux/icon.png'],
  ['assets/win32/icon-nightly.png', 'assets/win32/icon.png'],
  ['assets/win32/icon-nightly.ico', 'assets/win32/icon.ico'],
  ['build-assets/icon/PearPass-nightly.png', 'build-assets/icon/PearPass.png']
]

for (const [from, to] of iconSwaps) {
  const src = path.join(root, from)
  const dst = path.join(root, to)
  if (!fs.existsSync(src)) {
    console.error(`[apply-flavor] Missing nightly asset: ${from}`)
    process.exit(1)
  }
  fs.copyFileSync(src, dst)
  console.log(`[apply-flavor] swapped ${to} <- ${from}`)
}

function rewriteJson(relPath, mutate) {
  const abs = path.join(root, relPath)
  const json = JSON.parse(fs.readFileSync(abs, 'utf8'))
  mutate(json)
  fs.writeFileSync(abs, JSON.stringify(json, null, 2) + '\n', 'utf8')
  console.log(`[apply-flavor] rewrote ${relPath}`)
}

rewriteJson('package.json', (pkg) => {
  if (pkg.productName !== STABLE_NAME) {
    throw new Error(
      `[apply-flavor] package.json productName is "${pkg.productName}", expected "${STABLE_NAME}"`
    )
  }
  pkg.productName = NIGHTLY_NAME
  if (pkg.build?.appId === STABLE_APP_ID) {
    pkg.build.appId = NIGHTLY_APP_ID
  }
})

rewriteJson('electron-builder.mac.json', (cfg) => {
  if (cfg.appId === STABLE_APP_ID) cfg.appId = NIGHTLY_APP_ID
})
rewriteJson('electron-builder.linux.json', (cfg) => {
  if (cfg.appId === STABLE_APP_ID) cfg.appId = NIGHTLY_APP_ID
})

const manifestPath = path.join(root, 'build-assets/win/AppxManifest.xml')
let manifest = fs.readFileSync(manifestPath, 'utf8')
// Order matters: Name="PearPass" is a substring of DisplayName="PearPass", so
// swap the more specific tokens first to avoid collateral rewrites.
const manifestSwaps = [
  [`DisplayName="${MSIX_STABLE_IDENTITY}"`, `DisplayName="${NIGHTLY_NAME}"`],
  [
    `<DisplayName>${MSIX_STABLE_IDENTITY}</DisplayName>`,
    `<DisplayName>${NIGHTLY_NAME}</DisplayName>`
  ],
  // electron-packager derives the .exe name from productName, so the manifest
  // must point at PearPass-nightly.exe once productName is rewritten.
  [`app\\${STABLE_NAME}.exe`, `app\\${NIGHTLY_NAME}.exe`],
  [`Alias="${STABLE_NAME}.exe"`, `Alias="${NIGHTLY_NAME}.exe"`],
  [`Name="${MSIX_STABLE_IDENTITY}"`, `Name="${MSIX_NIGHTLY_IDENTITY}"`]
]
for (const [from, to] of manifestSwaps) {
  if (!manifest.includes(from)) {
    throw new Error(
      `[apply-flavor] AppxManifest.xml missing expected token: ${from}`
    )
  }
  manifest = manifest.split(from).join(to)
}
fs.writeFileSync(manifestPath, manifest, 'utf8')
console.log('[apply-flavor] rewrote build-assets/win/AppxManifest.xml')

console.log(`[apply-flavor] flavor="${flavor}" applied`)
