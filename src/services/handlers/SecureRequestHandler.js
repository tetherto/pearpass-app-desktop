import { logger } from '../../utils/logger'
import {
  recordIncomingSeq,
  decryptWithSession,
  encryptWithSession
} from '../security/sessionManager.js'
import { getSession } from '../security/sessionStore.js'

/**
 * Handles secure encrypted requests from the extension
 */
export class SecureRequestHandler {
  constructor(client, methodRegistry) {
    this.client = client
    this.methodRegistry = methodRegistry
  }

  /**
   * Process a secure encrypted request
   */
  async handle(params) {
    const { sessionId, nonceB64, ciphertextB64, seq } = params || {}

    // Validate request
    this.validateSecurePayload(sessionId, nonceB64, ciphertextB64)

    // Check session and replay protection
    await this.validateSession(sessionId, seq)

    // Decrypt request
    const request = await this.decryptRequest(
      sessionId,
      nonceB64,
      ciphertextB64
    )

    logger.debug('SECURE-REQUEST', `Received method: ${request.method}`)

    // Execute method through registry
    const result = await this.methodRegistry.execute(
      request.method,
      request.params,
      { client: this.client }
    )

    // Encrypt response
    return await this.encryptResponse(sessionId, result)
  }

  validateSecurePayload(sessionId, nonceB64, ciphertextB64) {
    if (!sessionId || !nonceB64 || !ciphertextB64) {
      throw new Error('InvalidSecurePayload')
    }
  }

  async validateSession(sessionId, seq) {
    const session = getSession(sessionId)
    if (!session) {
      throw new Error('SessionNotFound')
    }
    recordIncomingSeq(sessionId, seq)
    return session
  }

  async decryptRequest(sessionId, nonceB64, ciphertextB64) {
    const nonce = new Uint8Array(Buffer.from(nonceB64, 'base64'))
    const ciphertext = new Uint8Array(Buffer.from(ciphertextB64, 'base64'))
    const plaintext = decryptWithSession(sessionId, nonce, ciphertext)
    return JSON.parse(Buffer.from(plaintext).toString('utf8'))
  }

  async encryptResponse(sessionId, result) {
    const responsePlaintext = Buffer.from(
      JSON.stringify({ ok: true, result }),
      'utf8'
    )
    return encryptWithSession(sessionId, new Uint8Array(responsePlaintext))
  }
}
