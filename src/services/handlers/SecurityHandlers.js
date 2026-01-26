import sodium from 'sodium-native'

import { SecurityErrorCodes } from '../../constants/securityErrors.js'
import { createErrorWithCode } from '../../utils/createErrorWithCode.js'
import { getNativeMessagingEnabled } from '../nativeMessagingPreferences.js'
import {
  getOrCreateIdentity,
  getFingerprint,
  verifyPairingToken,
  resetIdentity,
  setClientIdentityPublicKey,
  getClientIdentityPublicKey
} from '../security/appIdentity.js'
import { PROTOCOL_TAGS } from '../security/protocolConstants.js'
import { beginHandshake } from '../security/sessionManager.js'
import {
  getSession,
  closeSession,
  clearAllSessions,
  concatBytes
} from '../security/sessionStore.js'

/**
 * Handles security-related IPC operations for native messaging
 */
export class SecurityHandlers {
  constructor(client) {
    this.client = client
  }

  /**
   * Get the app's identity for pairing
   */
  async nmGetAppIdentity(params) {
    const { pairingToken, clientEd25519PublicKeyB64 } = params || {}

    // Require a pairing token that the user manually copied from desktop app
    if (!pairingToken) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.PAIRING_TOKEN_REQUIRED,
          'Please enter the pairing token from the desktop app'
        )
      )
    }

    // Require the extension to provide its public key for mutual authentication
    if (!clientEd25519PublicKeyB64) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.CLIENT_PUBLIC_KEY_REQUIRED,
          'Extension must provide its Ed25519 public key'
        )
      )
    }

    const id = await getOrCreateIdentity(this.client)

    // Verify the pairing token matches what the desktop app expects
    const isValidToken = await verifyPairingToken(
      this.client,
      id.ed25519PublicKey,
      pairingToken
    )
    if (!isValidToken) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.INVALID_PAIRING_TOKEN,
          'The pairing token is incorrect'
        )
      )
    }

    // Check if a different client is already paired
    const existingClientPubB64 = await getClientIdentityPublicKey()
    if (
      existingClientPubB64 &&
      existingClientPubB64 !== clientEd25519PublicKeyB64
    ) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.CLIENT_ALREADY_PAIRED,
          'A different extension is already paired. Reset pairing in the desktop app first.'
        )
      )
    }

    // Store the client's public key for mutual auth in future handshakes
    await setClientIdentityPublicKey(this.client, clientEd25519PublicKeyB64)

    return {
      ed25519PublicKey: id.ed25519PublicKey,
      x25519PublicKey: id.x25519PublicKey,
      fingerprint: getFingerprint(id.ed25519PublicKey)
    }
  }

  /**
   * Begin secure handshake with extension
   */
  async nmBeginHandshake(params) {
    // Only allow handshake if native messaging is enabled
    // This prevents previously paired extensions from reconnecting after being disabled
    if (!getNativeMessagingEnabled()) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.NATIVE_MESSAGING_DISABLED,
          'Extension connection is disabled'
        )
      )
    }

    // Require a pinned client public key (set during pairing via nmGetAppIdentity)
    const clientPubB64 = await getClientIdentityPublicKey()
    if (!clientPubB64) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.NOT_PAIRED,
          'No client identity registered. Please complete pairing first.'
        )
      )
    }

    const { extEphemeralPubB64 } = params || {}
    if (!extEphemeralPubB64) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.MISSING_EPHEMERAL_PUBLIC_KEY,
          'extEphemeralPubB64 is required'
        )
      )
    }
    return beginHandshake(this.client, extEphemeralPubB64)
  }

  /**
   * Finish handshake by validating session
   */
  async nmFinishHandshake(params) {
    const { sessionId, clientSigB64 } = params || {}
    if (!sessionId) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.MISSING_SESSION_ID,
          'sessionId is required'
        )
      )
    }
    if (!clientSigB64) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.MISSING_CLIENT_SIGNATURE,
          'clientSigB64 is required'
        )
      )
    }

    const session = getSession(sessionId)
    if (!session) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.SESSION_NOT_FOUND,
          'Session not found or expired'
        )
      )
    }
    if (session.clientVerified) return { ok: true }

    // Load pinned client identity
    const clientPubB64 = await getClientIdentityPublicKey()
    if (!clientPubB64) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.CLIENT_NOT_PAIRED,
          'No client identity registered'
        )
      )
    }

    const clientPubBytes = new Uint8Array(Buffer.from(clientPubB64, 'base64'))
    const sigBytes = new Uint8Array(Buffer.from(clientSigB64, 'base64'))
    if (clientPubBytes.length !== sodium.crypto_sign_PUBLICKEYBYTES) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.INVALID_CLIENT_PUBLIC_KEY,
          'Invalid client public key length'
        )
      )
    }
    if (sigBytes.length !== sodium.crypto_sign_BYTES) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.INVALID_CLIENT_SIGNATURE,
          'Invalid signature length'
        )
      )
    }
    if (!session.transcript || session.transcript.length === 0) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.INVALID_TRANSCRIPT,
          'Session transcript is missing or empty'
        )
      )
    }

    // Build client transcript with protocol tag + session ID binding
    // Client signs: tag || session_id || host_eph_pk || ext_eph_pk || client_ed25519_pk
    const protocolTag = Buffer.from(PROTOCOL_TAGS.CLIENT_FINISH, 'utf8')
    const sessionIdBytes = Buffer.from(String(sessionId), 'utf8')
    const clientTranscript = concatBytes(
      concatBytes(protocolTag, sessionIdBytes),
      session.transcript
    )

    // Verify client Ed25519 signature over enhanced transcript
    const ok = sodium.crypto_sign_verify_detached(
      sigBytes,
      clientTranscript,
      clientPubBytes
    )

    if (!ok) {
      // On failure, drop the session
      closeSession(sessionId)
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.CLIENT_SIGNATURE_INVALID,
          'Client signature verification failed'
        )
      )
    }

    // Mark session as verified
    session.clientVerified = true

    return { ok: true }
  }

  /**
   * Close a secure session
   */
  async nmCloseSession(params) {
    const { sessionId } = params || {}
    if (!sessionId) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.MISSING_SESSION_ID,
          'sessionId is required'
        )
      )
    }
    closeSession(sessionId)
    return { ok: true }
  }

  /**
   * Check if an extension is paired with this desktop app
   * @param {Object} params
   * @param {string} params.clientEd25519PublicKeyB64 - Extension's public key
   */
  async checkExtensionPairingStatus(params) {
    const { clientEd25519PublicKeyB64 } = params || {}

    if (!getNativeMessagingEnabled()) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.NATIVE_MESSAGING_DISABLED,
          'Extension connection is disabled'
        )
      )
    }

    if (!clientEd25519PublicKeyB64) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.CLIENT_PUBLIC_KEY_REQUIRED,
          'clientEd25519PublicKeyB64 is required'
        )
      )
    }

    const storedClientPubB64 = await getClientIdentityPublicKey()
    const paired = storedClientPubB64 === clientEd25519PublicKeyB64

    return {
      paired
    }
  }

  /**
   * Reset pairing by generating new identity keys and clearing all sessions
   * This will unpair the connected extension
   */
  async nmResetPairing() {
    const clearedSessions = clearAllSessions()

    const newIdentity = await resetIdentity(this.client)

    return {
      ok: true,
      clearedSessions,
      newIdentity: {
        ed25519PublicKey: newIdentity.ed25519PublicKey,
        x25519PublicKey: newIdentity.x25519PublicKey,
        creationDate: newIdentity.creationDate
      }
    }
  }
}
