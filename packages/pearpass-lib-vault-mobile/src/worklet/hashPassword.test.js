import sodium from 'sodium-native'

import { hashPassword } from './hashPassword'

const mockSalt = Buffer.alloc(sodium.crypto_pwhash_SALTBYTES, 'a')
const mockHashedPassword = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES, 'b')

jest.mock('sodium-native', () => ({
  crypto_pwhash_SALTBYTES: 32,
  crypto_secretbox_KEYBYTES: 32,
  crypto_pwhash_OPSLIMIT_INTERACTIVE: 2,
  crypto_pwhash_OPSLIMIT_SENSITIVE: 4,
  crypto_pwhash_MEMLIMIT_INTERACTIVE: 67108864,
  crypto_pwhash_ALG_DEFAULT: 2,
  randombytes_buf: jest.fn((buf) => {
    buf.set(mockSalt)
  }),
  sodium_malloc: jest.fn((size) => Buffer.alloc(size)),
  crypto_pwhash: jest.fn((out) => {
    mockHashedPassword.copy(out)
  })
}))

describe('hashPassword', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should generate a salt and a hashed password', () => {
    const password = 'my-secret-password'
    const result = hashPassword(password)

    expect(sodium.randombytes_buf).toHaveBeenCalledTimes(1)
    expect(sodium.sodium_malloc).toHaveBeenCalledWith(
      sodium.crypto_secretbox_KEYBYTES
    )
    expect(sodium.crypto_pwhash).toHaveBeenCalledTimes(1)

    const hashedPasswordBuffer = sodium.sodium_malloc.mock.results[1].value
    expect(sodium.crypto_pwhash).toHaveBeenCalledWith(
      hashedPasswordBuffer,
      Buffer.from(password),
      expect.any(Buffer),
      sodium.crypto_pwhash_OPSLIMIT_SENSITIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_DEFAULT
    )

    expect(result).toEqual({
      hashedPassword: mockHashedPassword.toString('hex'),
      salt: mockSalt.toString('base64')
    })
  })

  it('should return different results for different mock implementations', () => {
    const password = 'another-password'

    const differentSalt = Buffer.alloc(sodium.crypto_pwhash_SALTBYTES, 'c')
    const differentHashedPassword = Buffer.alloc(
      sodium.crypto_secretbox_KEYBYTES,
      'd'
    )

    sodium.randombytes_buf.mockImplementationOnce((buf) => {
      buf.set(differentSalt)
    })
    sodium.crypto_pwhash.mockImplementationOnce((out) => {
      out.set(differentHashedPassword)
    })

    const result = hashPassword(password)

    expect(result).toEqual({
      hashedPassword: differentHashedPassword.toString('hex'),
      salt: differentSalt.toString('base64')
    })
  })
})
