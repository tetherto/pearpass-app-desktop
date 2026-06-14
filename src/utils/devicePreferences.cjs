/**
 * Persistence for main-process device preferences.
 *
 * Stored as JSON at `<storageDir>/device-preferences.json`. Read at
 * main-process startup (sync) and rewritten when a setting changes.
 * Missing/malformed file → everything falls back to DEFAULTS. Adding a new
 * preference means adding a key to DEFAULTS and reading/writing it through
 * this module.
 */
const fs = require('fs')
const path = require('path')

const FILE_NAME = 'device-preferences.json'

const DEFAULTS = {
  loggingEnabled: false,
  backgroundModeEnabled: false
}

const PREF_KEYS = Object.keys(DEFAULTS)

function coerce(raw) {
  /** @type {Record<string, boolean>} */
  const out = {}
  for (const key of PREF_KEYS) {
    out[key] = !!raw[key]
  }
  return out
}

function read(storageDir) {
  try {
    const raw = fs.readFileSync(path.join(storageDir, FILE_NAME), 'utf8')
    const parsed = JSON.parse(raw)
    return coerce(parsed)
  } catch {
    return { ...DEFAULTS }
  }
}

function write(storageDir, partial) {
  fs.mkdirSync(storageDir, { recursive: true })
  const merged = { ...read(storageDir), ...partial }
  fs.writeFileSync(
    path.join(storageDir, FILE_NAME),
    JSON.stringify(coerce(merged)) + '\n',
    'utf8'
  )
}

module.exports = { read, write }
