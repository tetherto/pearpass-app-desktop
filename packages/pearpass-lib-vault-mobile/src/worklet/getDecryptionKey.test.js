import sodium from 'sodium-native'

import { getDecryptionKey } from './getDecryptionKey'

jest.mock('sodium-native', () => {
  const mockSodium = {
    sodium_malloc: jest.fn().mockImplementation((size) => Buffer.alloc(size)),
    crypto_secretbox_KEYBYTES: 32,
    crypto_pwhash_OPSLIMIT_INTERACTIVE: 2,
    crypto_pwhash_OPSLIMIT_SENSITIVE: 4,
    crypto_pwhash_MEMLIMIT_INTERACTIVE: 67108864,
    crypto_pwhash_ALG_DEFAULT: 2,
    crypto_pwhash: jest.fn().mockImplementation((out) => {
      Buffer.from('mockDecryptionKeyResult'.padEnd(out.length, '0')).copy(out)
    })
  }
  return mockSodium
})

describe('getDecryptionKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return a base64 encoded string', () => {
    const result = getDecryptionKey({
      salt: 'c29tZXNhbHQ=',
      password: 'mypassword'
    })

    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(() => Buffer.from(result, 'base64')).not.toThrow()
  })

  test('should call sodium.crypto_pwhash with correct parameters', () => {
    const salt = 'c29tZXNhbHQ='
    const password = 'mypassword'

    getDecryptionKey({
      salt,
      password
    })

    expect(sodium.sodium_malloc).toHaveBeenCalledWith(
      sodium.crypto_secretbox_KEYBYTES
    )
    expect(sodium.crypto_pwhash).toHaveBeenCalledWith(
      expect.any(Buffer),
      Buffer.from(password),
      Buffer.from(salt, 'base64'),
      sodium.crypto_pwhash_OPSLIMIT_SENSITIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_DEFAULT
    )
  })

  test('should return different keys for different passwords', () => {
    const salt = 'c29tZXNhbHQ='

    sodium.crypto_pwhash.mockImplementation((out, password) => {
      const result = `key_for_${password.toString()}`
      Buffer.from(result.padEnd(out.length, '0')).copy(out)
    })

    const key1 = getDecryptionKey({ salt, password: 'password1' })
    const key2 = getDecryptionKey({ salt, password: 'password2' })

    expect(key1).not.toBe(key2)
  })

  test('should return different keys for different salts', () => {
    sodium.crypto_pwhash.mockImplementation((out, password, salt) => {
      const result = `key_for_salt_${salt.toString('base64')}`
      Buffer.from(result.padEnd(out.length, '0')).copy(out)
    })

    const key1 = getDecryptionKey({
      salt: 'c29tZXNhbHQ=',
      password: 'password'
    })
    const key2 = getDecryptionKey({
      salt: 'b3RoZXJzYWx0',
      password: 'password'
    })

    expect(key1).not.toBe(key2)
  })
})
