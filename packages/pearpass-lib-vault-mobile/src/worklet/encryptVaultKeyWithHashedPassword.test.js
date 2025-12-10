import sodium from 'sodium-native'

import { encryptVaultKeyWithHashedPassword } from './encryptVaultKeyWithHashedPassword'

jest.mock('sodium-native', () => ({
  crypto_secretbox_NONCEBYTES: 24,
  crypto_secretbox_MACBYTES: 16,
  randombytes_buf: jest.fn(),
  crypto_secretbox_easy: jest.fn(),
  sodium_malloc: jest.fn((size) => Buffer.alloc(size))
}))

describe('encryptVaultKeyWithHashedPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should correctly encrypt a key using a hashed password', () => {
    const hashedPassword =
      'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
    const mockKey = Buffer.alloc(32, 'k')
    const mockNonce = Buffer.alloc(24, 'n')
    const mockCiphertext = Buffer.alloc(32 + 16, 'c')

    sodium.randombytes_buf
      .mockImplementationOnce((buf) => {
        buf.set(mockKey)
      })
      .mockImplementationOnce((buf) => {
        buf.set(mockNonce)
      })

    sodium.crypto_secretbox_easy.mockImplementation((ciphertext) => {
      ciphertext.set(mockCiphertext)
    })

    const result = encryptVaultKeyWithHashedPassword(hashedPassword)

    expect(sodium.randombytes_buf).toHaveBeenCalledTimes(2)
    expect(sodium.crypto_secretbox_easy).toHaveBeenCalledTimes(1)

    const [ciphertextArg, keyArg, nonceArg, hashedPasswordArg] =
      sodium.crypto_secretbox_easy.mock.calls[0]

    expect(ciphertextArg).toBeInstanceOf(Buffer)
    expect(ciphertextArg.length).toBe(32 + 16)
    expect(keyArg).toEqual(mockKey)
    expect(nonceArg).toEqual(mockNonce)
    expect(hashedPasswordArg).toEqual(Buffer.from(hashedPassword, 'hex'))

    expect(result).toEqual({
      ciphertext: mockCiphertext.toString('base64'),
      nonce: mockNonce.toString('base64')
    })
  })

  test('should return base64 encoded strings', () => {
    const hashedPassword = 'testpassword'
    const result = encryptVaultKeyWithHashedPassword(hashedPassword)

    // Check if the output is a valid base64 string
    const isBase64 = (str) => {
      try {
        return btoa(atob(str)) === str
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        return false
      }
    }

    expect(isBase64(result.ciphertext)).toBe(true)
    expect(isBase64(result.nonce)).toBe(true)
  })
})
