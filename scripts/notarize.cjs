#!/usr/bin/env node
/**
 * Electron-builder afterSign hook: notarize the macOS app using the "notary" keychain profile.
 * CI must run: xcrun notarytool store-credentials "notary" ... before the build.
 */
const path = require('path')

const { notarize } = require('@electron/notarize')

exports.default = async function notarizeHook(context) {
  const { electronPlatformName, appOutDir, packager } = context
  if (electronPlatformName !== 'darwin') return
  if (process.env.SKIP_NOTARIZE === 'true') {
    console.log('Skipping notarization')
    return
  }
  const appName = packager.appInfo.productFilename
  const appPath = path.join(appOutDir, `${appName}.app`)

  await notarize({
    appPath,
    keychainProfile: 'notary',
    tool: 'notarytool'
  })
}
