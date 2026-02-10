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
import { SecurityErrorCodes } from '../../constants/securityErrors'
import {
  getAutoLockTimeoutMs,
  isAutoLockEnabled
} from '../../hooks/useAutoLockPreferences.js'
import {
  applyAutoLockEnabled,
  applyAutoLockTimeout
} from '../../utils/autoLock.js'
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

jest.mock('../../utils/autoLock', () => ({
  applyAutoLockEnabled: jest.fn(),
  applyAutoLockTimeout: jest.fn()
}))
jest.mock(
  '../../hooks/useAutoLockPreferences.js',
  () => ({
    getAutoLockTimeoutMs: jest.fn(),
    isAutoLockEnabled: jest.fn()
  }),
  { virtual: true }
)

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
        SecurityErrorCodes.PAIRING_TOKEN_REQUIRED
      )
    })

    it('throws if clientEd25519PublicKeyB64 is missing', async () => {
      await expect(
        handlers.nmGetAppIdentity({ pairingToken: 'token' })
      ).rejects.toThrow(SecurityErrorCodes.CLIENT_PUBLIC_KEY_REQUIRED)
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
      ).rejects.toThrow(SecurityErrorCodes.INVALID_PAIRING_TOKEN)
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
        'clientPub',
        'PENDING'
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
      appIdentity.getClientPairingState.mockResolvedValue('CONFIRMED')

      await expect(
        handlers.nmGetAppIdentity({
          pairingToken: 'token',
          clientEd25519PublicKeyB64: 'differentClientPub'
        })
      ).rejects.toThrow(SecurityErrorCodes.CLIENT_ALREADY_PAIRED)

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

      expect(appIdentity.setClientIdentityPublicKey).not.toHaveBeenCalled()
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
      ).rejects.toThrow(SecurityErrorCodes.NATIVE_MESSAGING_DISABLED)
    })

    it('throws if no client public key is stored (not paired)', async () => {
      appIdentity.getClientIdentityPublicKey.mockResolvedValue(null)

      await expect(
        handlers.nmBeginHandshake({ extEphemeralPubB64: 'abc' })
      ).rejects.toThrow(SecurityErrorCodes.NOT_PAIRED)
      expect(sessionManager.beginHandshake).not.toHaveBeenCalled()
    })

    it('throws if extEphemeralPubB64 is missing', async () => {
      await expect(handlers.nmBeginHandshake({})).rejects.toThrow(
        SecurityErrorCodes.MISSING_EPHEMERAL_PUBLIC_KEY
      )
    })

    it('calls beginHandshake with correct params when client is paired', async () => {
      appIdentity.getClientIdentityPublicKey.mockResolvedValue('clientPubKey')
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
        SecurityErrorCodes.MISSING_SESSION_ID
      )
    })

    it('throws if clientSigB64 is missing', async () => {
      await expect(
        handlers.nmFinishHandshake({ sessionId: 'sid' })
      ).rejects.toThrow(SecurityErrorCodes.MISSING_CLIENT_SIGNATURE)
    })

    it('throws if session not found', async () => {
      sessionStore.getSession.mockReturnValue(undefined)
      await expect(
        handlers.nmFinishHandshake({
          sessionId: 'sid',
          clientSigB64: 'sig'
        })
      ).rejects.toThrow(SecurityErrorCodes.SESSION_NOT_FOUND)
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
      ).rejects.toThrow(SecurityErrorCodes.CLIENT_NOT_PAIRED)
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
      ).rejects.toThrow(SecurityErrorCodes.CLIENT_SIGNATURE_INVALID)

      expect(sessionStore.closeSession).toHaveBeenCalledWith('sid')
      expect(session.clientVerified).not.toBe(true)
    })
  })

  describe('nmCloseSession', () => {
    it('throws if sessionId is missing', async () => {
      await expect(handlers.nmCloseSession({})).rejects.toThrow(
        SecurityErrorCodes.MISSING_SESSION_ID
      )
    })

    it('calls closeSession and returns ok', async () => {
      sessionStore.closeSession.mockReturnValue(undefined)
      const result = await handlers.nmCloseSession({ sessionId: 'sid' })
      expect(sessionStore.closeSession).toHaveBeenCalledWith('sid')
      expect(result).toEqual({ ok: true })
    })
  })

  describe('checkExtensionPairingStatus', () => {
    it('throws if clientEd25519PublicKeyB64 is missing', async () => {
      await expect(handlers.checkExtensionPairingStatus({})).rejects.toThrow(
        SecurityErrorCodes.CLIENT_PUBLIC_KEY_REQUIRED
      )
    })

    it('returns paired=true when client key matches', async () => {
      appIdentity.getCachedClientIdentityPublicKey.mockReturnValue(
        'clientPubKey123'
      )
      const result = await handlers.checkExtensionPairingStatus({
        clientEd25519PublicKeyB64: 'clientPubKey123'
      })
      expect(result.paired).toBe(true)
    })

    it('returns paired=false when key does not match', async () => {
      appIdentity.getCachedClientIdentityPublicKey.mockReturnValue(
        'differentKey'
      )
      const result = await handlers.checkExtensionPairingStatus({
        clientEd25519PublicKeyB64: 'clientPubKey123'
      })
      expect(result.paired).toBe(false)
    })

    it('returns paired=false when no client key is stored', async () => {
      appIdentity.getCachedClientIdentityPublicKey.mockReturnValue(null)
      const result = await handlers.checkExtensionPairingStatus({
        clientEd25519PublicKeyB64: 'clientPubKey123'
      })
      expect(result.paired).toBe(false)
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

  describe('auto-lock handlers', () => {
    beforeEach(() => {
      getNativeMessagingEnabled.mockReturnValue(true)
      isAutoLockEnabled.mockReturnValue(true)
      getAutoLockTimeoutMs.mockReturnValue(999)
    })

    describe('getAutoLockSettings', () => {
      it('throws when native messaging is disabled', async () => {
        getNativeMessagingEnabled.mockReturnValue(false)
        await expect(handlers.getAutoLockSettings()).rejects.toThrow(
          SecurityErrorCodes.NATIVE_MESSAGING_DISABLED
        )
      })

      it('returns enabled and timeout values', async () => {
        const result = await handlers.getAutoLockSettings()
        expect(result).toEqual({
          autoLockEnabled: true,
          autoLockTimeoutMs: 999
        })
      })
    })

    describe('setAutoLockTimeout', () => {
      it('throws when native messaging is disabled', async () => {
        getNativeMessagingEnabled.mockReturnValue(false)
        await expect(
          handlers.setAutoLockTimeout({ autoLockTimeoutMs: 1234 })
        ).rejects.toThrow(SecurityErrorCodes.NATIVE_MESSAGING_DISABLED)
      })

      it('throws when autoLockTimeoutMs is missing', async () => {
        await expect(handlers.setAutoLockTimeout({})).rejects.toThrow(
          SecurityErrorCodes.MISSING_AUTO_LOCK_TIMEOUT_MS
        )
      })

      it('applies timeout when provided', async () => {
        await handlers.setAutoLockTimeout({ autoLockTimeoutMs: 1234 })
        expect(applyAutoLockTimeout).toHaveBeenCalledWith(1234)
      })

      it('accepts null timeout (never) when provided', async () => {
        const result = await handlers.setAutoLockTimeout({
          autoLockTimeoutMs: null
        })
        expect(applyAutoLockTimeout).toHaveBeenCalledWith(null)
        expect(result).toEqual({ ok: true })
      })
    })

    describe('setAutoLockEnabled', () => {
      it('throws when native messaging is disabled', async () => {
        getNativeMessagingEnabled.mockReturnValue(false)
        await expect(
          handlers.setAutoLockEnabled({ autoLockEnabled: true })
        ).rejects.toThrow(SecurityErrorCodes.NATIVE_MESSAGING_DISABLED)
      })

      it('throws when autoLockEnabled is not boolean', async () => {
        await expect(
          handlers.setAutoLockEnabled({ autoLockEnabled: 'yes' })
        ).rejects.toThrow(SecurityErrorCodes.INVALID_AUTO_LOCK_ENABLED)
      })

      it('applies enabled flag when valid', async () => {
        await handlers.setAutoLockEnabled({ autoLockEnabled: false })
        expect(applyAutoLockEnabled).toHaveBeenCalledWith(false)
      })
    })

    describe('resetTimer', () => {
      it('throws when native messaging is disabled', async () => {
        getNativeMessagingEnabled.mockReturnValue(false)
        await expect(handlers.resetTimer()).rejects.toThrow(
          SecurityErrorCodes.NATIVE_MESSAGING_DISABLED
        )
      })

      it('dispatches reset-timer event when enabled', async () => {
        const dispatchSpy = jest.spyOn(window, 'dispatchEvent')
        await handlers.resetTimer()
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'reset-timer' })
        )
      })
    })
  })
})
