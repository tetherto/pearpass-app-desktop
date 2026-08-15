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
import * as pairedClients from '../security/pairedClients'
import * as pairingInvites from '../security/pairingInvites'
import * as sessionManager from '../security/sessionManager'
import * as sessionStore from '../security/sessionStore'

jest.mock('../security/appIdentity')
jest.mock('../security/pairedClients')
jest.mock('../security/pairingInvites')
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

    it('throws if no live invite matches the pairing token', async () => {
      appIdentity.getOrCreateIdentity.mockResolvedValue({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey'
      })
      pairingInvites.findLiveInviteByCode.mockResolvedValue(null)

      await expect(
        handlers.nmGetAppIdentity({
          pairingToken: 'token',
          clientEd25519PublicKeyB64: 'clientPub'
        })
      ).rejects.toThrow(SecurityErrorCodes.INVALID_PAIRING_TOKEN)

      expect(pairedClients.addPendingClient).not.toHaveBeenCalled()
    })

    it('registers the client and consumes the invite when the code is valid', async () => {
      appIdentity.getOrCreateIdentity.mockResolvedValue({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey'
      })
      appIdentity.getFingerprint.mockReturnValue('fingerprint')
      pairingInvites.findLiveInviteByCode.mockResolvedValue({
        id: 'invite-1',
        label: 'Chrome'
      })
      pairedClients.getClient.mockResolvedValue(null)

      const result = await handlers.nmGetAppIdentity({
        pairingToken: 'token',
        clientEd25519PublicKeyB64: 'clientPub'
      })

      expect(pairedClients.addPendingClient).toHaveBeenCalledWith(client, {
        publicKey: 'clientPub',
        label: 'Chrome',
        inviteId: 'invite-1'
      })
      expect(pairingInvites.consumeInvite).toHaveBeenCalledWith(
        client,
        'invite-1',
        'clientPub'
      )
      expect(result).toEqual({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey',
        fingerprint: 'fingerprint'
      })
    })

    it('pairs a second browser without disturbing the first', async () => {
      appIdentity.getOrCreateIdentity.mockResolvedValue({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey'
      })
      appIdentity.getFingerprint.mockReturnValue('fingerprint')
      pairingInvites.findLiveInviteByCode.mockResolvedValue({
        id: 'invite-2',
        label: 'Firefox'
      })
      // The first browser is already registered under a different key
      pairedClients.getClient.mockResolvedValue(null)

      await handlers.nmGetAppIdentity({
        pairingToken: 'second-code',
        clientEd25519PublicKeyB64: 'secondClientPub'
      })

      expect(pairedClients.addPendingClient).toHaveBeenCalledWith(client, {
        publicKey: 'secondClientPub',
        label: 'Firefox',
        inviteId: 'invite-2'
      })
    })

    it('is a no-op for a client that is already registered', async () => {
      appIdentity.getOrCreateIdentity.mockResolvedValue({
        ed25519PublicKey: 'pubKey',
        x25519PublicKey: 'xPubKey'
      })
      appIdentity.getFingerprint.mockReturnValue('fingerprint')
      pairingInvites.findLiveInviteByCode.mockResolvedValue({
        id: 'invite-1',
        label: 'Chrome'
      })
      pairedClients.getClient.mockResolvedValue({
        publicKey: 'sameClientPub',
        label: 'Chrome'
      })

      const result = await handlers.nmGetAppIdentity({
        pairingToken: 'token',
        clientEd25519PublicKeyB64: 'sameClientPub'
      })

      expect(pairedClients.addPendingClient).not.toHaveBeenCalled()
      expect(pairingInvites.consumeInvite).not.toHaveBeenCalled()
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
      // By default, simulate a single confirmed client
      pairedClients.listConfirmedClients.mockResolvedValue([
        { publicKey: 'clientPubKey' }
      ])
    })

    it('throws if native messaging is disabled', async () => {
      getNativeMessagingEnabled.mockReturnValue(false)
      await expect(
        handlers.nmBeginHandshake({ extEphemeralPubB64: 'abc' })
      ).rejects.toThrow(SecurityErrorCodes.NATIVE_MESSAGING_DISABLED)
    })

    it('throws if no client is paired', async () => {
      pairedClients.listConfirmedClients.mockResolvedValue([])

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

    it('resolves the only paired client when the extension does not identify itself', async () => {
      sessionManager.beginHandshake.mockResolvedValue('handshake-result')

      const result = await handlers.nmBeginHandshake({
        extEphemeralPubB64: 'abc'
      })

      expect(sessionManager.beginHandshake).toHaveBeenCalledWith(
        client,
        'abc',
        'clientPubKey'
      )
      expect(result).toBe('handshake-result')
    })

    it('throws AMBIGUOUS_CLIENT when several browsers are paired and the caller is anonymous', async () => {
      pairedClients.listConfirmedClients.mockResolvedValue([
        { publicKey: 'chromeKey' },
        { publicKey: 'firefoxKey' }
      ])

      await expect(
        handlers.nmBeginHandshake({ extEphemeralPubB64: 'abc' })
      ).rejects.toThrow(SecurityErrorCodes.AMBIGUOUS_CLIENT)
      expect(sessionManager.beginHandshake).not.toHaveBeenCalled()
    })

    it('handshakes with the named client when several browsers are paired', async () => {
      pairedClients.listConfirmedClients.mockResolvedValue([
        { publicKey: 'chromeKey' },
        { publicKey: 'firefoxKey' }
      ])
      sessionManager.beginHandshake.mockResolvedValue('handshake-result')

      const result = await handlers.nmBeginHandshake({
        extEphemeralPubB64: 'abc',
        clientEd25519PublicKeyB64: 'firefoxKey'
      })

      expect(sessionManager.beginHandshake).toHaveBeenCalledWith(
        client,
        'abc',
        'firefoxKey'
      )
      expect(result).toBe('handshake-result')
    })

    it('throws NOT_PAIRED when the named client is unknown', async () => {
      pairedClients.listConfirmedClients.mockResolvedValue([
        { publicKey: 'chromeKey' }
      ])

      await expect(
        handlers.nmBeginHandshake({
          extEphemeralPubB64: 'abc',
          clientEd25519PublicKeyB64: 'strangerKey'
        })
      ).rejects.toThrow(SecurityErrorCodes.NOT_PAIRED)
      expect(sessionManager.beginHandshake).not.toHaveBeenCalled()
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

    it('throws if the session carries no client identity', async () => {
      sessionStore.getSession.mockReturnValue({
        id: 'sid',
        transcript: new Uint8Array([1, 2, 3]),
        clientPublicKey: null
      })

      await expect(
        handlers.nmFinishHandshake({
          sessionId: 'sid',
          clientSigB64: Buffer.from('sig').toString('base64')
        })
      ).rejects.toThrow(SecurityErrorCodes.CLIENT_NOT_PAIRED)
    })

    it('verifies against the client the session was opened for', async () => {
      const chromeKey = Buffer.alloc(32, 7).toString('base64')
      const session = {
        id: 'sid',
        transcript: new Uint8Array([1, 2, 3]),
        clientPublicKey: chromeKey
      }
      sessionStore.getSession.mockReturnValue(session)
      const sodium = require('sodium-native')
      sodium.crypto_sign_verify_detached.mockReturnValue(true)

      const result = await handlers.nmFinishHandshake({
        sessionId: 'sid',
        clientSigB64: Buffer.alloc(64, 2).toString('base64')
      })

      expect(result).toEqual({ ok: true })
      expect(session.clientVerified).toBe(true)
      // Third argument is the public key the signature is checked against
      expect(sodium.crypto_sign_verify_detached.mock.calls[0][2]).toEqual(
        new Uint8Array(Buffer.from(chromeKey, 'base64'))
      )
    })

    it('throws ClientSignatureInvalid and closes session when signature is invalid', async () => {
      const session = {
        id: 'sid',
        transcript: new Uint8Array([1, 2, 3]),
        clientPublicKey: Buffer.alloc(32, 1).toString('base64')
      }
      sessionStore.getSession.mockReturnValue(session)
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

    it('returns paired=true for any cached client key', async () => {
      pairedClients.getCachedClientPublicKeys.mockReturnValue([
        'firstKey',
        'clientPubKey123'
      ])
      const result = await handlers.checkExtensionPairingStatus({
        clientEd25519PublicKeyB64: 'clientPubKey123'
      })
      expect(result.paired).toBe(true)
    })

    it('returns paired=false when key is not cached', async () => {
      pairedClients.getCachedClientPublicKeys.mockReturnValue(['differentKey'])
      const result = await handlers.checkExtensionPairingStatus({
        clientEd25519PublicKeyB64: 'clientPubKey123'
      })
      expect(result.paired).toBe(false)
    })

    it('returns paired=false when no client key is stored', async () => {
      pairedClients.getCachedClientPublicKeys.mockReturnValue([])
      const result = await handlers.checkExtensionPairingStatus({
        clientEd25519PublicKeyB64: 'clientPubKey123'
      })
      expect(result.paired).toBe(false)
    })
  })

  describe('nmConfirmPairing', () => {
    it('confirms the client and announces the change', async () => {
      const listener = jest.fn()
      window.addEventListener('paired-browsers-changed', listener)

      const result = await handlers.nmConfirmPairing({
        clientEd25519PublicKeyB64: 'clientPub'
      })

      expect(pairedClients.confirmClient).toHaveBeenCalledWith(
        client,
        'clientPub'
      )
      expect(listener).toHaveBeenCalled()
      expect(result).toEqual({ confirmed: true })

      window.removeEventListener('paired-browsers-changed', listener)
    })

    it('throws if the client public key is missing', async () => {
      await expect(handlers.nmConfirmPairing({})).rejects.toThrow(
        SecurityErrorCodes.CLIENT_PUBLIC_KEY_REQUIRED
      )
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
