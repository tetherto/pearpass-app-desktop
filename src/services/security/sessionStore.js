// Session store for Native Messaging secure channel
// This module contains the session storage and basic operations
// Separated from sessionManager.js to avoid circular dependencies

import sodium from 'sodium-native'

/** @typedef {{ key: Uint8Array, sendSeq: number, lastRecvSeq: number, transcript: Uint8Array, clientPublicKey: string|null, clientVerified: boolean, createdAt: number }} Session */

const SESSIONS = new Map()

// Session TTL: 1 hour in milliseconds
const SESSION_TTL_MS = 60 * 60 * 1000

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
 * @param {string|null} [clientPublicKey] - base64 Ed25519 key of the paired
 *   extension this session belongs to, used to verify its signature later and
 *   to close its sessions when it is unpaired
 * @returns {{ sessionId: string, key: Uint8Array }}
 */
export const createSession = (
  sharedSecret,
  transcript,
  clientPublicKey = null
) => {
  const key = deriveSessionKey(sharedSecret, transcript)
  const sessionIdBytes = randomBytes(16)
  const sessionId = Buffer.from(sessionIdBytes).toString('hex')
  SESSIONS.set(sessionId, {
    key,
    sendSeq: 0,
    lastRecvSeq: 0,
    transcript,
    clientPublicKey,
    clientVerified: false,
    createdAt: Date.now()
  })
  return { sessionId, key }
}

/**
 * @param {string} sessionId
 * @returns {Session | null}
 */
export const getSession = (sessionId) => {
  const session = SESSIONS.get(sessionId)
  if (!session) return null
  if (
    typeof session.createdAt !== 'number' ||
    !Number.isFinite(session.createdAt)
  ) {
    SESSIONS.delete(sessionId)
    return null
  }

  // Check if session has expired
  if (Date.now() - session.createdAt >= SESSION_TTL_MS) {
    SESSIONS.delete(sessionId)
    return null
  }

  return session
}

/**
 * @param {string} sessionId
 */
export const closeSession = (sessionId) => {
  SESSIONS.delete(sessionId)
}

/**
 * Close every session belonging to one extension, leaving other extensions
 * connected. Used when a single browser is unpaired.
 * @param {string} clientPublicKey
 * @returns {number} how many sessions were closed
 */
export const closeSessionsForClient = (clientPublicKey) => {
  let closed = 0
  for (const [sessionId, session] of SESSIONS) {
    if (session.clientPublicKey === clientPublicKey) {
      SESSIONS.delete(sessionId)
      closed++
    }
  }
  return closed
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
