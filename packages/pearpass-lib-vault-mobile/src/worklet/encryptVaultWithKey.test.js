import sodium from 'sodium-native'

import { encryptVaultWithKey } from './encryptVaultWithKey'

jest.mock('sodium-native', () => ({
  crypto_secretbox_NONCEBYTES: 24,
  crypto_secretbox_MACBYTES: 16,
  randombytes_buf: jest.fn(),
  crypto_secretbox_easy: jest.fn(),
  sodium_malloc: jest.fn((size) => Buffer.alloc(size))
}))

describe('encryptVaultWithKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    Buffer.alloc = jest.fn((size) => ({
      length: size,
      toString: jest.fn().mockReturnValue('mocked-base64-string')
    }))

    Buffer.from = jest.fn().mockImplementation((data) => ({
      length: typeof data === 'string' ? data.length : data.byteLength,
      toString: jest.fn().mockReturnValue('mocked-base64-string')
    }))
  })

  it('should encrypt vault with provided key and return ciphertext and nonce', () => {
    const hashedPassword = 'testHashedPassword'
    const key = 'testKey'

    const result = encryptVaultWithKey(hashedPassword, key)

    expect(sodium.randombytes_buf).toHaveBeenCalled()
    expect(sodium.crypto_secretbox_easy).toHaveBeenCalled()
    expect(result).toHaveProperty('ciphertext')
    expect(result).toHaveProperty('nonce')
    expect(result.ciphertext).toBe('mocked-base64-string')
    expect(result.nonce).toBe('mocked-base64-string')
  })

  it('should allocate proper buffer sizes', () => {
    const hashedPassword = 'testHashedPassword'
    const key = 'testKey'

    encryptVaultWithKey(hashedPassword, key)

    expect(sodium.sodium_malloc).toHaveBeenCalledWith(
      key.length + sodium.crypto_secretbox_MACBYTES
    )
  })

  it('should convert arguments to proper formats', () => {
    const hashedPassword = 'testHashedPassword'
    const key = 'base64EncodedKey'

    encryptVaultWithKey(hashedPassword, key)

    expect(Buffer.from).toHaveBeenCalledWith(key, 'base64')
    expect(Buffer.from).toHaveBeenCalledWith(hashedPassword, 'hex')
  })
})
