import sodium from 'sodium-native'

import {
  getOrCreateIdentity,
  getPairingCode,
  getFingerprint,
  __getMemIdentity
} from './appIdentity'
import { logger } from '../../utils/logger'

// Mock dependencies
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock('sodium-native', () => ({
  crypto_sign_SECRETKEYBYTES: 64,
  crypto_sign_PUBLICKEYBYTES: 32,
  crypto_box_SECRETKEYBYTES: 32,
  crypto_box_PUBLICKEYBYTES: 32,
  crypto_sign_keypair: jest.fn((pk, sk) => {
    // Mock keypair generation
    pk.fill(1)
    sk.fill(2)
  }),
  crypto_box_keypair: jest.fn((pk, sk) => {
    // Mock keypair generation
    pk.fill(3)
    sk.fill(4)
  }),
  crypto_hash_sha256: jest.fn((out, input) => {
    // Mock SHA256 - just fill with deterministic data
    for (let i = 0; i < out.length; i++) {
      out[i] = (input[0] + i) % 256
    }
  })
}))

describe('appIdentity', () => {
  let mockClient

  beforeEach(() => {
    jest.clearAllMocks()

    mockClient = {
      encryptionGetStatus: jest.fn(),
      encryptionInit: jest.fn(),
      encryptionGet: jest.fn(),
      encryptionAdd: jest.fn()
    }
  })

  describe('getOrCreateIdentity', () => {
    it('should initialize encryption if not initialized', async () => {
      mockClient.encryptionGetStatus.mockResolvedValue({ status: false })
      mockClient.encryptionInit.mockResolvedValue({ success: true })
      mockClient.encryptionGet.mockResolvedValue(null)
      mockClient.encryptionAdd.mockResolvedValue()

      await getOrCreateIdentity(mockClient)

      expect(mockClient.encryptionGetStatus).toHaveBeenCalled()
      expect(mockClient.encryptionInit).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(
        'APP-IDENTITY',
        'Encryption not initialized, initializing...'
      )
    })

    it('should generate new keypairs when none exist', async () => {
      mockClient.encryptionGetStatus.mockResolvedValue({ status: true })
      mockClient.encryptionGet.mockResolvedValue(null)
      mockClient.encryptionAdd.mockResolvedValue()

      const result = await getOrCreateIdentity(mockClient)

      expect(sodium.crypto_sign_keypair).toHaveBeenCalled()
      expect(sodium.crypto_box_keypair).toHaveBeenCalled()
      expect(mockClient.encryptionAdd).toHaveBeenCalledTimes(3) // ed25519, x25519, and creationDate
      expect(result).toHaveProperty('ed25519PublicKey')
      expect(result).toHaveProperty('x25519PublicKey')
      expect(result).toHaveProperty('creationDate')
      expect(typeof result.ed25519PublicKey).toBe('string')
      expect(typeof result.x25519PublicKey).toBe('string')
      expect(typeof result.creationDate).toBe('string')
    })

    it('should load existing keypairs from storage', async () => {
      mockClient.encryptionGetStatus.mockResolvedValue({ status: true })

      // Create mock stored keypairs
      const ed25519Mock = Buffer.concat([
        Buffer.alloc(32, 5), // public key
        Buffer.alloc(64, 6) // private key
      ]).toString('base64')

      const x25519Mock = Buffer.concat([
        Buffer.alloc(32, 7), // public key
        Buffer.alloc(32, 8) // private key
      ]).toString('base64')

      const creationDate = '2024-01-01T00:00:00.000Z'

      mockClient.encryptionGet
        .mockResolvedValueOnce(ed25519Mock)
        .mockResolvedValueOnce(x25519Mock)
        .mockResolvedValueOnce(creationDate)

      const result = await getOrCreateIdentity(mockClient)

      expect(sodium.crypto_sign_keypair).not.toHaveBeenCalled()
      expect(sodium.crypto_box_keypair).not.toHaveBeenCalled()
      expect(mockClient.encryptionAdd).not.toHaveBeenCalled()
      expect(result).toHaveProperty('ed25519PublicKey')
      expect(result).toHaveProperty('x25519PublicKey')
      expect(result).toHaveProperty('creationDate')
      expect(result.creationDate).toBe(creationDate)
    })

    it('should handle encryptionGet returning object with data property', async () => {
      mockClient.encryptionGetStatus.mockResolvedValue({ status: true })

      const ed25519Mock = Buffer.concat([
        Buffer.alloc(32, 5),
        Buffer.alloc(64, 6)
      ]).toString('base64')

      const x25519Mock = Buffer.concat([
        Buffer.alloc(32, 7),
        Buffer.alloc(32, 8)
      ]).toString('base64')

      const creationDate = '2024-01-01T00:00:00.000Z'

      mockClient.encryptionGet
        .mockResolvedValueOnce({ data: ed25519Mock })
        .mockResolvedValueOnce({ data: x25519Mock })
        .mockResolvedValueOnce({ data: creationDate })

      const result = await getOrCreateIdentity(mockClient)

      expect(result).toHaveProperty('ed25519PublicKey')
      expect(result).toHaveProperty('x25519PublicKey')
      expect(result).toHaveProperty('creationDate')
    })

    it('should use in-memory cache when storage is unavailable', async () => {
      mockClient.encryptionGetStatus.mockResolvedValue({ status: true })
      mockClient.encryptionGet.mockResolvedValue(null)
      mockClient.encryptionAdd.mockRejectedValue(new Error('Storage locked'))

      const result1 = await getOrCreateIdentity(mockClient)

      // Second call should use in-memory cache
      const result2 = await getOrCreateIdentity(mockClient)

      expect(result1.ed25519PublicKey).toBe(result2.ed25519PublicKey)
      expect(result1.x25519PublicKey).toBe(result2.x25519PublicKey)
      expect(__getMemIdentity()).not.toBeNull()
    })

    it('should handle encryption initialization failure gracefully', async () => {
      mockClient.encryptionGetStatus.mockRejectedValue(
        new Error('Status check failed')
      )
      mockClient.encryptionInit.mockResolvedValue({ success: true })
      mockClient.encryptionGet.mockResolvedValue(null)
      mockClient.encryptionAdd.mockResolvedValue()

      await getOrCreateIdentity(mockClient)

      expect(logger.info).toHaveBeenCalledWith(
        'APP-IDENTITY',
        expect.stringContaining('Status check failed')
      )
      expect(mockClient.encryptionInit).toHaveBeenCalled()
    })

    it('should ignore "already initialized" errors', async () => {
      mockClient.encryptionGetStatus.mockRejectedValue(
        new Error('Status check failed')
      )
      mockClient.encryptionInit.mockRejectedValue(
        new Error('Encryption already initialized')
      )
      mockClient.encryptionGet.mockResolvedValue(null)
      mockClient.encryptionAdd.mockResolvedValue()

      await getOrCreateIdentity(mockClient)

      expect(logger.error).not.toHaveBeenCalledWith(
        'APP-IDENTITY',
        expect.stringContaining('already initialized')
      )
    })
  })

  describe('getPairingCode', () => {
    it('should generate a 6-digit pairing code from public key', () => {
      const publicKeyB64 = Buffer.alloc(32, 42).toString('base64')
      const code = getPairingCode(publicKeyB64)

      expect(code).toMatch(/^\d{6}$/)
      expect(code.length).toBe(6)
    })

    it('should generate consistent codes for the same key', () => {
      const publicKeyB64 = Buffer.alloc(32, 123).toString('base64')
      const code1 = getPairingCode(publicKeyB64)
      const code2 = getPairingCode(publicKeyB64)

      expect(code1).toBe(code2)
    })

    it('should generate different codes for different keys', () => {
      const key1 = Buffer.alloc(32, 1).toString('base64')
      const key2 = Buffer.alloc(32, 2).toString('base64')

      const code1 = getPairingCode(key1)
      const code2 = getPairingCode(key2)

      expect(code1).not.toBe(code2)
    })
  })

  describe('getFingerprint', () => {
    it('should generate a hex SHA-256 fingerprint', () => {
      const publicKeyB64 = Buffer.alloc(32, 10).toString('base64')
      const fingerprint = getFingerprint(publicKeyB64)

      expect(fingerprint).toMatch(/^[0-9a-f]{64}$/)
      expect(fingerprint.length).toBe(64)
    })

    it('should generate consistent fingerprints for the same key', () => {
      const publicKeyB64 = Buffer.alloc(32, 20).toString('base64')
      const fp1 = getFingerprint(publicKeyB64)
      const fp2 = getFingerprint(publicKeyB64)

      expect(fp1).toBe(fp2)
    })

    it('should generate different fingerprints for different keys', () => {
      const key1 = Buffer.alloc(32, 30).toString('base64')
      const key2 = Buffer.alloc(32, 40).toString('base64')

      const fp1 = getFingerprint(key1)
      const fp2 = getFingerprint(key2)

      expect(fp1).not.toBe(fp2)
    })
  })
})
