/**
 * Pear runtime config for P2P OTA updates.
 */
const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')

function readDesignVersion() {
  try {
    const flagsPath = path.join(
      __dirname,
      '..',
      'node_modules',
      'pearpass-lib-constants',
      'src',
      'constants',
      'flags.js'
    )
    const content = fs.readFileSync(flagsPath, 'utf8')
    const match = content.match(/DESIGN_VERSION\s*=\s*(\d+)/)
    return match ? Number(match[1]) : 1
  } catch {
    return 1
  }
}

module.exports = {
  upgrade: process.env.PEARPASS_UPGRADE_LINK || pkg.upgrade || null,
  version: pkg.version ?? 0,
  designVersion: readDesignVersion()
}
