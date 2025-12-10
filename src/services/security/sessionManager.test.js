import sodium from 'sodium-native'

import {
  beginHandshake,
  recordIncomingSeq,
  encryptWithSession,
  decryptWithSession
} from './sessionManager'
import { getSession, closeSession } from './sessionStore'

// Mock dependencies
jest.mock('sodium-native', () => ({
  crypto_sign_SECRETKEYBYTES: 64,
  crypto_sign_PUBLICKEYBYTES: 32,
  crypto_sign_BYTES: 64,
  crypto_box_SECRETKEYBYTES: 32,
  crypto_box_PUBLICKEYBYTES: 32,
  crypto_secretbox_KEYBYTES: 32,
  crypto_secretbox_NONCEBYTES: 24,
  crypto_secretbox_MACBYTES: 16,
  crypto_sign_keypair: jest.fn((pk, sk) => {
    pk.fill(1)
    sk.fill(2)
  }),
  crypto_box_keypair: jest.fn((pk, sk) => {
    pk.fill(3)
    sk.fill(4)
  }),
  crypto_scalarmult: jest.fn((out, sk, pk) => {
    // Mock ECDH - just XOR for simplicity
    for (let i = 0; i < out.length; i++) {
      out[i] = sk[i] ^ pk[i]
    }
  }),
  crypto_hash_sha256: jest.fn((out, input) => {
    // Mock SHA256
    for (let i = 0; i < out.length; i++) {
      out[i] = (input[0] + i) % 256
    }
  }),
  // eslint-disable-next-line no-unused-vars
  crypto_sign_detached: jest.fn((sig, _msg, _sk) => {
    // Mock signature
    sig.fill(99)
  }),
  // eslint-disable-next-line no-unused-vars
  crypto_secretbox_easy: jest.fn((cipher, msg, _nonce, _key) => {
    // Mock encryption - just copy with a tag
    cipher.set(msg)
    cipher.set([0xaa, 0xbb, 0xcc], msg.length)
    return true
  }),
  // eslint-disable-next-line no-unused-vars
  crypto_secretbox_open_easy: jest.fn((msg, cipher, _nonce, _key) => {
    // Mock decryption - just copy without tag
    const msgLen = Math.max(0, cipher.length - 3)
    if (msgLen > 0 && msgLen <= msg.length) {
      msg.set(cipher.slice(0, msgLen))
    }
    return true
  }),
  randombytes_buf: jest.fn((buf) => {
    // Mock random bytes
    for (let i = 0; i < buf.length; i++) {
      buf[i] = Math.floor(Math.random() * 256)
    }
  })
}))

jest.mock('./appIdentity', () => ({
  getOrCreateIdentity: jest.fn().mockResolvedValue({
    ed25519PublicKey: 'mock-ed25519-public',
    x25519PublicKey: 'mock-x25519-public'
  }),
  __getMemIdentity: jest.fn(() => ({
    ed25519PublicKeyBytes: new Uint8Array(32).fill(10),
    ed25519PrivateKeyBytes: new Uint8Array(64).fill(11),
    x25519PublicKeyBytes: new Uint8Array(32).fill(12),
    x25519PrivateKeyBytes: new Uint8Array(32).fill(13)
  }))
}))

describe('sessionManager', () => {
  let mockClient

  beforeEach(() => {
    jest.clearAllMocks()

    mockClient = {
      encryptionGet: jest.fn()
    }
  })

  describe('beginHandshake', () => {
    it('should create a new session with ephemeral keys', async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 20).toString('base64')

      // Mock stored keys
      const ed25519Mock = Buffer.concat([
        Buffer.alloc(32, 5),
        Buffer.alloc(64, 6)
      ]).toString('base64')

      const x25519Mock = Buffer.concat([
        Buffer.alloc(32, 7),
        Buffer.alloc(32, 8)
      ]).toString('base64')

      mockClient.encryptionGet
        .mockResolvedValueOnce(ed25519Mock)
        .mockResolvedValueOnce(x25519Mock)

      const result = await beginHandshake(mockClient, extEphemeralPubB64)

      expect(result).toHaveProperty('sessionId')
      expect(result).toHaveProperty('hostEphemeralPubB64')
      expect(result).toHaveProperty('signatureB64')
      expect(typeof result.sessionId).toBe('string')
      expect(result.sessionId.length).toBe(32)
      expect(sodium.crypto_box_keypair).toHaveBeenCalled()
      expect(sodium.crypto_scalarmult).toHaveBeenCalled()
      expect(sodium.crypto_sign_detached).toHaveBeenCalled()
    })

    it('should derive shared secret using ECDH', async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 30).toString('base64')

      const ed25519Mock = Buffer.concat([
        Buffer.alloc(32, 5),
        Buffer.alloc(64, 6)
      ]).toString('base64')

      const x25519Mock = Buffer.concat([
        Buffer.alloc(32, 7),
        Buffer.alloc(32, 8)
      ]).toString('base64')

      mockClient.encryptionGet
        .mockResolvedValueOnce(ed25519Mock)
        .mockResolvedValueOnce(x25519Mock)

      const result = await beginHandshake(mockClient, extEphemeralPubB64)
      const session = getSession(result.sessionId)

      expect(session).toBeDefined()
      expect(session.key).toBeInstanceOf(Uint8Array)
      expect(session.key.length).toBe(32)
      expect(sodium.crypto_scalarmult).toHaveBeenCalledTimes(1)
    })

    it('should use in-memory identity when storage is unavailable', async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 40).toString('base64')

      mockClient.encryptionGet.mockResolvedValue(null)

      const result = await beginHandshake(mockClient, extEphemeralPubB64)

      expect(result).toHaveProperty('sessionId')
      expect(result).toHaveProperty('hostEphemeralPubB64')
      expect(result).toHaveProperty('signatureB64')

      const session = getSession(result.sessionId)
      expect(session).toBeDefined()
    })

    it('should initialize session with sequence numbers', async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 50).toString('base64')

      mockClient.encryptionGet.mockResolvedValue(null)

      const result = await beginHandshake(mockClient, extEphemeralPubB64)
      const session = getSession(result.sessionId)

      expect(session.sendSeq).toBe(0)
      expect(session.lastRecvSeq).toBe(0)
    })
  })

  describe('session management', () => {
    let sessionId

    beforeEach(async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 60).toString('base64')
      mockClient.encryptionGet.mockResolvedValue(null)
      const result = await beginHandshake(mockClient, extEphemeralPubB64)
      sessionId = result.sessionId
    })

    it('should get an existing session', () => {
      const session = getSession(sessionId)
      expect(session).toBeDefined()
      expect(session).toHaveProperty('key')
      expect(session).toHaveProperty('sendSeq')
      expect(session).toHaveProperty('lastRecvSeq')
    })

    it('should return undefined for non-existent session', () => {
      const session = getSession('invalid-session-id')
      expect(session).toBeNull()
    })

    it('should close and remove a session', () => {
      expect(getSession(sessionId)).toBeDefined()

      closeSession(sessionId)

      expect(getSession(sessionId)).toBeNull()
    })

    it('should handle closing non-existent session', () => {
      expect(() => closeSession('invalid-session-id')).not.toThrow()
    })
  })

  describe('replay protection', () => {
    let sessionId

    beforeEach(async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 70).toString('base64')
      mockClient.encryptionGet.mockResolvedValue(null)
      const result = await beginHandshake(mockClient, extEphemeralPubB64)
      sessionId = result.sessionId
    })

    it('should accept strictly increasing sequence numbers', () => {
      expect(() => recordIncomingSeq(sessionId, 1)).not.toThrow()
      expect(() => recordIncomingSeq(sessionId, 2)).not.toThrow()
      expect(() => recordIncomingSeq(sessionId, 3)).not.toThrow()

      const session = getSession(sessionId)
      expect(session.lastRecvSeq).toBe(3)
    })

    it('should reject repeated sequence numbers', () => {
      recordIncomingSeq(sessionId, 5)

      expect(() => recordIncomingSeq(sessionId, 5)).toThrow('ReplayDetected')
    })

    it('should reject decreasing sequence numbers', () => {
      recordIncomingSeq(sessionId, 10)

      expect(() => recordIncomingSeq(sessionId, 9)).toThrow('ReplayDetected')
    })

    it('should handle sequence number 0 correctly', () => {
      // Sequence 0 should be rejected since initial lastRecvSeq is 0
      expect(() => recordIncomingSeq(sessionId, 0)).toThrow('ReplayDetected')

      // But sequence 1 should be accepted
      expect(() => recordIncomingSeq(sessionId, 1)).not.toThrow()
    })
  })

  describe('encryption and decryption', () => {
    let sessionId

    beforeEach(async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 80).toString('base64')
      mockClient.encryptionGet.mockResolvedValue(null)
      const result = await beginHandshake(mockClient, extEphemeralPubB64)
      sessionId = result.sessionId
    })

    it('should encrypt data with session', () => {
      const plaintext = new Uint8Array([1, 2, 3, 4, 5])

      const result = encryptWithSession(sessionId, plaintext)

      expect(result).toHaveProperty('nonceB64')
      expect(result).toHaveProperty('ciphertextB64')
      expect(result).toHaveProperty('seq')
      expect(typeof result.nonceB64).toBe('string')
      expect(typeof result.ciphertextB64).toBe('string')
      expect(result.seq).toBe(1)
      expect(sodium.crypto_secretbox_easy).toHaveBeenCalled()
    })

    it('should increment send sequence on encryption', () => {
      const plaintext = new Uint8Array([1, 2, 3])

      const result1 = encryptWithSession(sessionId, plaintext)
      const result2 = encryptWithSession(sessionId, plaintext)
      const result3 = encryptWithSession(sessionId, plaintext)

      expect(result1.seq).toBe(1)
      expect(result2.seq).toBe(2)
      expect(result3.seq).toBe(3)

      const session = getSession(sessionId)
      expect(session.sendSeq).toBe(3)
    })

    it('should decrypt data with session', () => {
      const plaintext = new Uint8Array([10, 20, 30, 40])
      const encrypted = encryptWithSession(sessionId, plaintext)

      const nonce = new Uint8Array(Buffer.from(encrypted.nonceB64, 'base64'))
      const ciphertext = new Uint8Array(
        Buffer.from(encrypted.ciphertextB64, 'base64')
      )

      const decrypted = decryptWithSession(sessionId, nonce, ciphertext)

      expect(decrypted).toBeInstanceOf(Uint8Array)
      expect(sodium.crypto_secretbox_open_easy).toHaveBeenCalled()
    })

    it('should throw error for invalid session on encrypt', () => {
      const plaintext = new Uint8Array([1, 2, 3])

      expect(() => encryptWithSession('invalid-id', plaintext)).toThrow(
        'SessionNotFound'
      )
    })

    it('should throw error for invalid session on decrypt', () => {
      const nonce = new Uint8Array(24)
      const ciphertext = new Uint8Array(32)

      expect(() => decryptWithSession('invalid-id', nonce, ciphertext)).toThrow(
        'SessionNotFound'
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty plaintext encryption', async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 90).toString('base64')
      mockClient.encryptionGet.mockResolvedValue(null)
      const result = await beginHandshake(mockClient, extEphemeralPubB64)

      const plaintext = new Uint8Array(0)
      const encrypted = encryptWithSession(result.sessionId, plaintext)

      expect(encrypted).toHaveProperty('nonceB64')
      expect(encrypted).toHaveProperty('ciphertextB64')
      expect(encrypted).toHaveProperty('seq')
    })

    it('should handle large plaintext encryption', async () => {
      const extEphemeralPubB64 = Buffer.alloc(32, 100).toString('base64')
      mockClient.encryptionGet.mockResolvedValue(null)
      const result = await beginHandshake(mockClient, extEphemeralPubB64)

      const plaintext = new Uint8Array(10000).fill(42)
      const encrypted = encryptWithSession(result.sessionId, plaintext)

      expect(encrypted).toHaveProperty('nonceB64')
      expect(encrypted).toHaveProperty('ciphertextB64')
      expect(encrypted).toHaveProperty('seq')
    })
  })
})
