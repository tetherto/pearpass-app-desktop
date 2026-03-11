/**
 * Pear runtime config for P2P OTA updates.
 */
const pkg = require('../package.json')

module.exports = {
  upgrade: process.env.PEARPASS_UPGRADE_LINK || pkg.upgrade || null,
  version: pkg.version ?? 0
}
