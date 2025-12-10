import sodium from 'sodium-native'

import { decryptVaultKey } from './decryptVaultKey'
import { encryptVaultKeyWithHashedPassword } from './encryptVaultKeyWithHashedPassword'
import { hashPassword } from './hashPassword'

jest.mock('sodium-native', () => ({
  crypto_secretbox_KEYBYTES: 32,
  crypto_secretbox_NONCEBYTES: 24,
  crypto_secretbox_MACBYTES: 16,
  crypto_pwhash_SALTBYTES: 16,
  crypto_pwhash_OPSLIMIT_INTERACTIVE: 2,
  crypto_pwhash_MEMLIMIT_INTERACTIVE: 67108864,
  crypto_pwhash_ALG_DEFAULT: 2,
  crypto_pwhash: jest.fn(),
  crypto_secretbox_easy: jest.fn(),
  crypto_secretbox_open_easy: jest.fn(),
  sodium_malloc: jest.fn((size) => Buffer.alloc(size)),
  randombytes_buf: jest.fn((buffer) => {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = i % 256
    }
  })
}))

describe('decryptVaultKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should decrypt a vault key successfully', () => {
    sodium.crypto_secretbox_open_easy.mockImplementation((plainText) => {
      for (let i = 0; i < plainText.length; i++) {
        plainText[i] = 65 + (i % 26)
      }
      return true
    })

    const data = {
      ciphertext: Buffer.alloc(48).fill('a').toString('base64'),
      nonce: Buffer.alloc(24).fill('b').toString('base64'),
      hashedPassword: 'mySecureKey'
    }

    const result = decryptVaultKey(data)
    expect(result).toBeDefined()
    expect(sodium.crypto_secretbox_open_easy).toHaveBeenCalled()
  })

  it('should return undefined when decryption fails', () => {
    sodium.crypto_secretbox_open_easy.mockReturnValue(false)

    const data = {
      ciphertext: Buffer.alloc(48).fill('a').toString('base64'),
      nonce: Buffer.alloc(24).fill('b').toString('base64'),
      hashedPassword: 'wrongSecureKey'
    }

    const result = decryptVaultKey(data)
    expect(result).toBeUndefined()
  })

  it('should handle different input lengths properly', () => {
    sodium.crypto_secretbox_open_easy.mockReturnValue(true)

    const data = {
      ciphertext: Buffer.alloc(64).fill('x').toString('base64'),
      nonce: Buffer.alloc(24).fill('y').toString('base64'),
      hashedPassword: 'wrongSecureKey'
    }

    decryptVaultKey(data)

    expect(sodium.crypto_secretbox_open_easy.mock.calls[0][0].length).toBe(
      Buffer.from(data.ciphertext, 'base64').length -
        sodium.crypto_secretbox_MACBYTES
    )
  })

  it('should work with encryption and decryption together', () => {
    const originalPassword = 'testPassword123'

    sodium.crypto_secretbox_easy.mockImplementation((ciphertext, message) => {
      for (let i = 0; i < ciphertext.length; i++) {
        ciphertext[i] =
          i < sodium.crypto_secretbox_MACBYTES
            ? 0
            : message[i - sodium.crypto_secretbox_MACBYTES]
      }
    })

    sodium.crypto_secretbox_open_easy.mockImplementation(
      (plainText, ciphertext) => {
        for (let i = 0; i < plainText.length; i++) {
          plainText[i] = ciphertext[i + sodium.crypto_secretbox_MACBYTES]
        }
        return true
      }
    )

    const { hashedPassword } = hashPassword(originalPassword)
    const { ciphertext, nonce } =
      encryptVaultKeyWithHashedPassword(hashedPassword)

    const decryptedKey = decryptVaultKey({
      ciphertext: ciphertext,
      nonce: nonce,
      hashedPassword
    })

    expect(decryptedKey).toBeDefined()
  })
})
