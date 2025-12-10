import { getNativeMessagingEnabled } from '../nativeMessagingPreferences.js'
import {
  getOrCreateIdentity,
  getFingerprint,
  verifyPairingToken,
  resetIdentity
} from '../security/appIdentity.js'
import { beginHandshake } from '../security/sessionManager.js'
import {
  getSession,
  closeSession,
  clearAllSessions
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
    const { pairingToken } = params || {}

    // Require a pairing token that the user manually copied from desktop app
    if (!pairingToken) {
      throw new Error(
        'PairingTokenRequired: Please enter the pairing token from the desktop app'
      )
    }

    const id = await getOrCreateIdentity(this.client)

    // Verify the pairing token matches what the desktop app expects
    const isValidToken = await verifyPairingToken(
      id.ed25519PublicKey,
      pairingToken
    )
    if (!isValidToken) {
      throw new Error('InvalidPairingToken: The pairing token is incorrect')
    }

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
        'NativeMessagingDisabled: Extension connection is disabled'
      )
    }

    const { extEphemeralPubB64 } = params || {}
    if (!extEphemeralPubB64) throw new Error('Missing extEphemeralPubB64')
    return beginHandshake(this.client, extEphemeralPubB64)
  }

  /**
   * Finish handshake by validating session
   */
  async nmFinishHandshake(params) {
    const { sessionId } = params || {}
    if (!sessionId) throw new Error('Missing sessionId')
    if (!getSession(sessionId)) throw new Error('SessionNotFound')
    return { ok: true }
  }

  /**
   * Close a secure session
   */
  async nmCloseSession(params) {
    const { sessionId } = params || {}
    if (!sessionId) throw new Error('Missing sessionId')
    closeSession(sessionId)
    return { ok: true }
  }

  /**
   * Check if desktop app is available
   */
  async checkAvailability() {
    return {
      available: true,
      status: 'running',
      message: 'Desktop app is running'
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
