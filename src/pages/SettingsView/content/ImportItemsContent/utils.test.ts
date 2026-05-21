import { ImportOptionType } from './types'
import {
  detectIsEncrypted,
  isArgon2BitwardenExport,
  parseJsonContent
} from './utils'

describe('parseJsonContent', () => {
  it('parses a valid JSON object', () => {
    expect(parseJsonContent('{"encrypted":true,"items":[]}')).toEqual({
      encrypted: true,
      items: []
    })
  })

  it('returns null for malformed JSON', () => {
    expect(parseJsonContent('{not valid json')).toBeNull()
  })

  it('returns null for non-string (ArrayBuffer) content', () => {
    expect(parseJsonContent(new ArrayBuffer(8))).toBeNull()
  })

  it('returns null for JSON primitives and arrays', () => {
    expect(parseJsonContent('"a string"')).toBeNull()
    expect(parseJsonContent('42')).toBeNull()
    expect(parseJsonContent('null')).toBeNull()
    expect(parseJsonContent('[1,2,3]')).toBeNull()
  })
})

describe('detectIsEncrypted', () => {
  it('returns false for non-JSON file types', () => {
    expect(
      detectIsEncrypted(ImportOptionType.Bitwarden, 'csv', {
        encrypted: true,
        passwordProtected: true
      })
    ).toBe(false)
  })

  it('returns false when the parsed JSON is null (e.g. malformed file)', () => {
    expect(detectIsEncrypted(ImportOptionType.Encrypted, 'json', null)).toBe(
      false
    )
  })

  it('returns false when the encrypted flag is missing', () => {
    expect(
      detectIsEncrypted(ImportOptionType.Encrypted, 'json', { items: [] })
    ).toBe(false)
  })

  describe('PearPass-encrypted exports', () => {
    it('treats a single encrypted:true flag as encrypted', () => {
      expect(
        detectIsEncrypted(ImportOptionType.Encrypted, 'json', {
          encrypted: true
        })
      ).toBe(true)
    })

    it('returns false when encrypted is false', () => {
      expect(
        detectIsEncrypted(ImportOptionType.Encrypted, 'json', {
          encrypted: false
        })
      ).toBe(false)
    })
  })

  describe('Bitwarden exports', () => {
    it('treats password-protected exports as encrypted', () => {
      expect(
        detectIsEncrypted(ImportOptionType.Bitwarden, 'json', {
          encrypted: true,
          passwordProtected: true
        })
      ).toBe(true)
    })

    it('treats account-restricted exports (encrypted only) as NOT encrypted', () => {
      // Account-restricted exports set `encrypted: true` but no
      // `passwordProtected` flag — they can never be decrypted with a password,
      // so the password screen must not be shown for them.
      expect(
        detectIsEncrypted(ImportOptionType.Bitwarden, 'json', {
          encrypted: true
        })
      ).toBe(false)
    })

    it('returns false for an unencrypted Bitwarden export', () => {
      expect(
        detectIsEncrypted(ImportOptionType.Bitwarden, 'json', {
          encrypted: false
        })
      ).toBe(false)
    })
  })
})

describe('isArgon2BitwardenExport', () => {
  it('returns true for Bitwarden Argon2id exports (kdfType === 1)', () => {
    expect(
      isArgon2BitwardenExport({
        encrypted: true,
        passwordProtected: true,
        kdfType: 1,
        kdfIterations: 3,
        kdfMemory: 64,
        kdfParallelism: 4
      })
    ).toBe(true)
  })

  it('returns false for Bitwarden PBKDF2 exports (kdfType === 0)', () => {
    expect(
      isArgon2BitwardenExport({
        encrypted: true,
        passwordProtected: true,
        kdfType: 0,
        kdfIterations: 600000
      })
    ).toBe(false)
  })

  it('returns false when kdfType is missing', () => {
    expect(
      isArgon2BitwardenExport({ encrypted: true, passwordProtected: true })
    ).toBe(false)
  })

  it('returns false when parsedJson is null', () => {
    expect(isArgon2BitwardenExport(null)).toBe(false)
  })
})
