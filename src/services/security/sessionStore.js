// Session store for Native Messaging secure channel
// This module contains the session storage and basic operations
// Separated from sessionManager.js to avoid circular dependencies

import sodium from 'sodium-native'

/** @typedef {{ key: Uint8Array, sendSeq: number, lastRecvSeq: number }} Session */

const SESSIONS = new Map()

/**
 * @param {number} size
 * @returns {Uint8Array}
 */
export const randomBytes = (size) => {
  const out = new Uint8Array(size)
  sodium.randombytes_buf(out)
  return out
}

/**
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 * @returns {Uint8Array}
 */
export const concatBytes = (left, right) =>
  new Uint8Array(Buffer.concat([Buffer.from(left), Buffer.from(right)]))

/**
 * Derive 32-byte session key as H = SHA-256(shared || transcript)
 * @param {Uint8Array} sharedSecret
 * @param {Uint8Array} transcript
 * @returns {Uint8Array}
 */
export const deriveSessionKey = (sharedSecret, transcript) => {
  const out = new Uint8Array(32)
  const input = concatBytes(sharedSecret, transcript)
  sodium.crypto_hash_sha256(out, input)
  return out
}

/**
 * Create a new session from shared secret and transcript.
 * @param {Uint8Array} sharedSecret
 * @param {Uint8Array} transcript
 * @returns {{ sessionId: string, key: Uint8Array }}
 */
export const createSession = (sharedSecret, transcript) => {
  const key = deriveSessionKey(sharedSecret, transcript)
  const sessionIdBytes = randomBytes(16)
  const sessionId = Buffer.from(sessionIdBytes).toString('hex')
  SESSIONS.set(sessionId, { key, sendSeq: 0, lastRecvSeq: 0 })
  return { sessionId, key }
}

/**
 * @param {string} sessionId
 * @returns {Session | null}
 */
export const getSession = (sessionId) => SESSIONS.get(sessionId) || null

/**
 * @param {string} sessionId
 */
export const closeSession = (sessionId) => {
  SESSIONS.delete(sessionId)
}

/**
 * Clear all active sessions
 * This will unpair all connected extensions
 */
export const clearAllSessions = () => {
  const count = SESSIONS.size
  SESSIONS.clear()
  return count
}
