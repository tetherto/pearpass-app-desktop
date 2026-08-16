/* eslint-env jest */

import fs from 'fs'
import os from 'os'
import path from 'path'

const { read, write } = require('./devicePreferences.cjs')

describe('devicePreferences', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'device-preferences-'))
  })
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('returns defaults when the file is missing', () => {
    expect(read(tmpDir)).toEqual({
      loggingEnabled: false,
      backgroundModeEnabled: false
    })
  })

  it('returns defaults on malformed JSON', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'device-preferences.json'),
      'not-json{',
      'utf8'
    )
    expect(read(tmpDir)).toEqual({
      loggingEnabled: false,
      backgroundModeEnabled: false
    })
  })

  it('writes then reads back loggingEnabled=true', () => {
    write(tmpDir, { loggingEnabled: true })
    expect(read(tmpDir)).toEqual({
      loggingEnabled: true,
      backgroundModeEnabled: false
    })
  })

  it('coerces truthy/falsy values to booleans', () => {
    write(tmpDir, { loggingEnabled: 'yes' })
    expect(read(tmpDir)).toEqual({
      loggingEnabled: true,
      backgroundModeEnabled: false
    })

    write(tmpDir, { loggingEnabled: 0 })
    expect(read(tmpDir)).toEqual({
      loggingEnabled: false,
      backgroundModeEnabled: false
    })
  })

  it('creates the storage directory if missing', () => {
    const nested = path.join(tmpDir, 'does', 'not', 'exist')
    write(nested, { loggingEnabled: true })
    expect(fs.existsSync(path.join(nested, 'device-preferences.json'))).toBe(
      true
    )
  })

  it('partial write preserves other keys', () => {
    // Pre-write a file with both keys, then do an empty partial write
    // and verify neither key is lost.
    write(tmpDir, { loggingEnabled: true, backgroundModeEnabled: true })
    expect(read(tmpDir)).toEqual({
      loggingEnabled: true,
      backgroundModeEnabled: true
    })

    // Empty partial write — both keys should be preserved
    write(tmpDir, {})
    expect(read(tmpDir)).toEqual({
      loggingEnabled: true,
      backgroundModeEnabled: true
    })
  })
})
