jest.mock('sodium-native', () => ({
  crypto_sign_keypair: jest.fn(),
  crypto_sign_ed25519_pk_to_curve25519: jest.fn(),
  crypto_sign_ed25519_sk_to_curve25519: jest.fn(),
  crypto_kx_keypair: jest.fn(),
  crypto_kx_server_session_keys: jest.fn(),
  crypto_kx_client_session_keys: jest.fn(),
  crypto_secretbox_easy: jest.fn(),
  crypto_secretbox_open_easy: jest.fn(),
  randombytes_buf: jest.fn(),
  sodium_malloc: jest.fn((size) => Buffer.alloc(size)),
  crypto_sign_PUBLICKEYBYTES: 32,
  crypto_sign_BYTES: 64,
  crypto_sign_SECRETKEYBYTES: 64,
  crypto_kx_PUBLICKEYBYTES: 32,
  crypto_kx_SECRETKEYBYTES: 32,
  crypto_kx_SESSIONKEYBYTES: 32,
  crypto_secretbox_NONCEBYTES: 24,
  crypto_secretbox_MACBYTES: 16,
  crypto_sign_verify_detached: jest.fn()
}))

import { SecurityHandlers } from './SecurityHandlers'
import { getNativeMessagingEnabled } from '../nativeMessagingPreferences'
import * as appIdentity from '../security/appIdentity'
import * as sessionManager from '../security/sessionManager'
import * as sessionStore from '../security/sessionStore'

jest.mock('../security/appIdentity')
jest.mock('../security/sessionManager')
jest.mock('../security/sessionStore')
jest.mock('../nativeMessagingPreferences', () => ({
  getNativeMessagingEnabled: jest.fn()
}))

describe('SecurityHandlers', () => {
  let client
  let handlers

  beforeEach(() => {
    client = { id: 'test-client' }
    handlers = new SecurityHandlers(client)
    jest.clearAllMocks()
  })

  describe('nmGetAppIdentity', () => {
    it('throws if pairingToken is missing', async () => {
      await expect(handlers.nmGetAppIdentity({})).rejects.toThrow(
        /PairingTokenRequired/
      )
    })

    it('throws if clientEd25519PublicKeyB64 is missing', async () => {
      await expect(
        handlers.nmGetAppIdentity({ pairingToken: 'token' })
      ).rejects.toThrow(/ClientPublicKeyRequired/)
    })

    it('throws if verifyPairingToken returns false', async () => {
      appIdentity.getOrCreateIdentity.mockResolvedValue({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey'
      })
      appIdentity.verifyPairingToken.mockResolvedValue(false)
      await expect(
        handlers.nmGetAppIdentity({
          pairingToken: 'token',
          clientEd25519PublicKeyB64: 'clientPub'
        })
      ).rejects.toThrow(/InvalidPairingToken/)
    })

    it('returns identity info and stores client public key if pairingToken is valid', async () => {
      appIdentity.getOrCreateIdentity.mockResolvedValue({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey'
      })
      appIdentity.verifyPairingToken.mockResolvedValue(true)
      appIdentity.getFingerprint.mockReturnValue('fingerprint')
      appIdentity.setClientIdentityPublicKey.mockResolvedValue(undefined)
      appIdentity.getClientIdentityPublicKey.mockResolvedValue(null)

      const result = await handlers.nmGetAppIdentity({
        pairingToken: 'token',
        clientEd25519PublicKeyB64: 'clientPub'
      })

      expect(appIdentity.setClientIdentityPublicKey).toHaveBeenCalledWith(
        client,
        'clientPub'
      )
      expect(result).toEqual({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey',
        fingerprint: 'fingerprint'
      })
    })

    it('throws if a different client is already paired', async () => {
      appIdentity.getOrCreateIdentity.mockResolvedValue({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey'
      })
      appIdentity.verifyPairingToken.mockResolvedValue(true)
      appIdentity.getClientIdentityPublicKey.mockResolvedValue(
        'existingClientPub'
      )

      await expect(
        handlers.nmGetAppIdentity({
          pairingToken: 'token',
          clientEd25519PublicKeyB64: 'differentClientPub'
        })
      ).rejects.toThrow(/ClientAlreadyPaired/)

      expect(appIdentity.setClientIdentityPublicKey).not.toHaveBeenCalled()
    })

    it('allows re-pairing same client with valid token', async () => {
      appIdentity.getOrCreateIdentity.mockResolvedValue({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey'
      })
      appIdentity.verifyPairingToken.mockResolvedValue(true)
      appIdentity.getFingerprint.mockReturnValue('fingerprint')
      appIdentity.setClientIdentityPublicKey.mockResolvedValue(undefined)
      appIdentity.getClientIdentityPublicKey.mockResolvedValue('sameClientPub')

      const result = await handlers.nmGetAppIdentity({
        pairingToken: 'token',
        clientEd25519PublicKeyB64: 'sameClientPub'
      })

      expect(appIdentity.setClientIdentityPublicKey).toHaveBeenCalledWith(
        client,
        'sameClientPub'
      )
      expect(result).toEqual({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey',
        fingerprint: 'fingerprint'
      })
    })
  })

  describe('nmBeginHandshake', () => {
    beforeEach(() => {
      getNativeMessagingEnabled.mockReturnValue(true)
      // By default, simulate a paired client with a stored public key
      appIdentity.getClientIdentityPublicKey.mockResolvedValue('clientPubKey')
    })

    it('throws if native messaging is disabled', async () => {
      getNativeMessagingEnabled.mockReturnValue(false)
      await expect(
        handlers.nmBeginHandshake({ extEphemeralPubB64: 'abc' })
      ).rejects.toThrow(/NativeMessagingDisabled/)
    })

    it('throws if no client public key is stored (not paired)', async () => {
      appIdentity.getClientIdentityPublicKey.mockResolvedValue(null)

      await expect(
        handlers.nmBeginHandshake({ extEphemeralPubB64: 'abc' })
      ).rejects.toThrow(/NotPaired/)
      expect(sessionManager.beginHandshake).not.toHaveBeenCalled()
    })

    it('throws if extEphemeralPubB64 is missing', async () => {
      await expect(handlers.nmBeginHandshake({})).rejects.toThrow(
        /Missing extEphemeralPubB64/
      )
    })

    it('calls beginHandshake with correct params when client is paired', async () => {
      sessionManager.beginHandshake.mockResolvedValue('handshake-result')
      const result = await handlers.nmBeginHandshake({
        extEphemeralPubB64: 'abc'
      })
      expect(appIdentity.getClientIdentityPublicKey).toHaveBeenCalledWith(
        client
      )
      expect(sessionManager.beginHandshake).toHaveBeenCalledWith(client, 'abc')
      expect(result).toBe('handshake-result')
    })
  })

  describe('nmFinishHandshake', () => {
    it('throws if sessionId is missing', async () => {
      await expect(handlers.nmFinishHandshake({})).rejects.toThrow(
        /Missing sessionId/
      )
    })

    it('throws if clientSigB64 is missing', async () => {
      await expect(
        handlers.nmFinishHandshake({ sessionId: 'sid' })
      ).rejects.toThrow(/MissingClientSignature/)
    })

    it('throws if session not found', async () => {
      sessionStore.getSession.mockReturnValue(undefined)
      await expect(
        handlers.nmFinishHandshake({
          sessionId: 'sid',
          clientSigB64: 'sig'
        })
      ).rejects.toThrow(/SessionNotFound/)
    })

    it('throws if client identity is not paired', async () => {
      sessionStore.getSession.mockReturnValue({
        id: 'sid',
        transcript: new Uint8Array([1, 2, 3])
      })
      appIdentity.getClientIdentityPublicKey.mockResolvedValue(null)

      await expect(
        handlers.nmFinishHandshake({
          sessionId: 'sid',
          clientSigB64: Buffer.from('sig').toString('base64')
        })
      ).rejects.toThrow(/ClientNotPaired/)
    })

    it('throws ClientSignatureInvalid and closes session when signature is invalid', async () => {
      const session = { id: 'sid', transcript: new Uint8Array([1, 2, 3]) }
      sessionStore.getSession.mockReturnValue(session)
      appIdentity.getClientIdentityPublicKey.mockResolvedValue(
        Buffer.alloc(32, 1).toString('base64')
      )
      const sodium = require('sodium-native')
      sodium.crypto_sign_verify_detached.mockReturnValue(false)

      await expect(
        handlers.nmFinishHandshake({
          sessionId: 'sid',
          clientSigB64: Buffer.alloc(64, 2).toString('base64')
        })
      ).rejects.toThrow(/ClientSignatureInvalid/)

      expect(sessionStore.closeSession).toHaveBeenCalledWith('sid')
      expect(session.clientVerified).not.toBe(true)
    })
  })

  describe('nmCloseSession', () => {
    it('throws if sessionId is missing', async () => {
      await expect(handlers.nmCloseSession({})).rejects.toThrow(
        /Missing sessionId/
      )
    })

    it('calls closeSession and returns ok', async () => {
      sessionStore.closeSession.mockReturnValue(undefined)
      const result = await handlers.nmCloseSession({ sessionId: 'sid' })
      expect(sessionStore.closeSession).toHaveBeenCalledWith('sid')
      expect(result).toEqual({ ok: true })
    })
  })

  describe('checkAvailability', () => {
    it('returns available status', async () => {
      const result = await handlers.checkAvailability()
      expect(result).toEqual({
        available: true,
        status: 'running',
        message: 'Desktop app is running'
      })
    })
  })

  describe('nmResetPairing', () => {
    it('clears sessions and resets identity', async () => {
      sessionStore.clearAllSessions.mockReturnValue(['sid1', 'sid2'])
      appIdentity.resetIdentity.mockResolvedValue({
        ed25519PublicKey: 'newPub',
        x25519PublicKey: 'newXPub',
        creationDate: '2024-01-01'
      })
      const result = await handlers.nmResetPairing()
      expect(sessionStore.clearAllSessions).toHaveBeenCalled()
      expect(appIdentity.resetIdentity).toHaveBeenCalledWith(client)
      expect(result).toEqual({
        ok: true,
        clearedSessions: ['sid1', 'sid2'],
        newIdentity: {
          ed25519PublicKey: 'newPub',
          x25519PublicKey: 'newXPub',
          creationDate: '2024-01-01'
        }
      })
    })
  })
})
