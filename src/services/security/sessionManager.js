// Session manager for Native Messaging secure channel
// Uses X25519 ECDH + Ed25519 signature (auth) and XSalsa20-Poly1305 (secretbox) for AEAD.

import sodium from 'sodium-native'

import { getOrCreateIdentity, __getMemIdentity } from './appIdentity.js'
import {
  randomBytes,
  concatBytes,
  createSession,
  getSession
} from './sessionStore.js'

/**
 * Encrypt payload with session key using secretbox (XSalsa20-Poly1305)
 * @param {string} sessionId
 * @param {Uint8Array} plaintext
 * @returns {{ nonceB64: string, ciphertextB64: string, seq: number }}
 */
export const encryptWithSession = (sessionId, plaintext) => {
  const session = getSession(sessionId)
  if (!session) throw new Error('SessionNotFound')
  const nonce = randomBytes(sodium.crypto_secretbox_NONCEBYTES)
  const ciphertext = new Uint8Array(
    plaintext.length + sodium.crypto_secretbox_MACBYTES
  )
  sodium.crypto_secretbox_easy(ciphertext, plaintext, nonce, session.key)
  const seq = ++session.sendSeq
  return {
    nonceB64: Buffer.from(nonce).toString('base64'),
    ciphertextB64: Buffer.from(ciphertext).toString('base64'),
    seq
  }
}

/**
 * Decrypt payload with session key
 * @param {string} sessionId
 * @param {Uint8Array} nonce
 * @param {Uint8Array} ciphertext
 * @returns {Uint8Array}
 */
export const decryptWithSession = (sessionId, nonce, ciphertext) => {
  const session = getSession(sessionId)
  if (!session) throw new Error('SessionNotFound')
  const plaintext = new Uint8Array(
    ciphertext.length - sodium.crypto_secretbox_MACBYTES
  )
  if (
    !sodium.crypto_secretbox_open_easy(
      plaintext,
      ciphertext,
      nonce,
      session.key
    )
  ) {
    throw new Error('DecryptFailed')
  }
  return plaintext
}

/**
 * Begin handshake: given extension ephemeral public key (base64),
 * return host ephemeral public key and signature over transcript.
 * @param {import('pearpass-lib-vault-mobile').PearpassVaultClient} client
 * @param {string} extensionEphemeralPublicKeyB64
 * @returns {{ hostEphemeralPubB64: string, signatureB64: string, sessionId: string }}
 */
export const beginHandshake = async (
  client,
  extensionEphemeralPublicKeyB64
) => {
  // Load or create identity, then load private parts from encryption store (or memory)
  await getOrCreateIdentity(client)
  // Support both direct string and { data } shapes from encryptionGet
  const edResponse = await client
    .encryptionGet('nm.identity.ed25519')
    .catch(() => null)
  const xResponse = await client
    .encryptionGet('nm.identity.x25519')
    .catch(() => null)
  const edBlobB64 =
    typeof edResponse === 'string' ? edResponse : edResponse?.data
  const xBlobB64 = typeof xResponse === 'string' ? xResponse : xResponse?.data
  if (!edBlobB64 || !xBlobB64) {
    // Try to use in-memory identity from appIdentity if available
    try {
      const mem = __getMemIdentity?.()
      if (mem) {
        return finalizeHandshakeWithMemoryIdentity(
          mem,
          extensionEphemeralPublicKeyB64
        )
      }
    } catch {}
    throw new Error('IdentityKeysUnavailable')
  }
  const edBuffer = Buffer.from(edBlobB64, 'base64')

  const ed25519PrivateKeyBytes = new Uint8Array(
    edBuffer.slice(
      sodium.crypto_sign_PUBLICKEYBYTES,
      sodium.crypto_sign_PUBLICKEYBYTES + sodium.crypto_sign_SECRETKEYBYTES
    )
  )

  const hostEphemeralPrivateKey = new Uint8Array(
    sodium.crypto_box_SECRETKEYBYTES
  )
  const hostEphemeralPublicKey = new Uint8Array(
    sodium.crypto_box_PUBLICKEYBYTES
  )
  sodium.crypto_box_keypair(hostEphemeralPublicKey, hostEphemeralPrivateKey)

  const extensionEphemeralPublicKey = new Uint8Array(
    Buffer.from(extensionEphemeralPublicKeyB64, 'base64')
  )

  // Compute ECDH
  const sharedSecret = new Uint8Array(32)
  sodium.crypto_scalarmult(
    sharedSecret,
    hostEphemeralPrivateKey,
    extensionEphemeralPublicKey
  )

  // Transcript = host_eph_pk || ext_eph_pk
  const transcript = concatBytes(
    hostEphemeralPublicKey,
    extensionEphemeralPublicKey
  )

  // Signature (Ed25519) over transcript
  const signature = new Uint8Array(sodium.crypto_sign_BYTES)
  sodium.crypto_sign_detached(signature, transcript, ed25519PrivateKeyBytes)

  // Create session
  const { sessionId } = createSession(sharedSecret, transcript)

  return {
    hostEphemeralPubB64: Buffer.from(hostEphemeralPublicKey).toString('base64'),
    signatureB64: Buffer.from(signature).toString('base64'),
    sessionId
  }
}

/**
 * Fallback: finalize handshake using in-memory identity keys
 * @param {{ ed25519PublicKeyBytes: Uint8Array, ed25519PrivateKeyBytes: Uint8Array, x25519PublicKeyBytes: Uint8Array, x25519PrivateKeyBytes: Uint8Array } | { edPk: Uint8Array, edSk: Uint8Array, xPk: Uint8Array, xSk: Uint8Array }} mem
 * @param {string} extensionEphemeralPublicKeyB64
 */
function finalizeHandshakeWithMemoryIdentity(
  mem,
  extensionEphemeralPublicKeyB64
) {
  const hostEphemeralPrivateKey = new Uint8Array(
    sodium.crypto_box_SECRETKEYBYTES
  )
  const hostEphemeralPublicKey = new Uint8Array(
    sodium.crypto_box_PUBLICKEYBYTES
  )
  sodium.crypto_box_keypair(hostEphemeralPublicKey, hostEphemeralPrivateKey)

  const extensionEphemeralPublicKey = new Uint8Array(
    Buffer.from(extensionEphemeralPublicKeyB64, 'base64')
  )

  // Compute ECDH
  const sharedSecret = new Uint8Array(32)
  sodium.crypto_scalarmult(
    sharedSecret,
    hostEphemeralPrivateKey,
    extensionEphemeralPublicKey
  )

  // Transcript = host_eph_pk || ext_eph_pk
  const transcript = concatBytes(
    hostEphemeralPublicKey,
    extensionEphemeralPublicKey
  )

  // Signature (Ed25519) over transcript
  const signature = new Uint8Array(sodium.crypto_sign_BYTES)
  const privateKey = mem.ed25519PrivateKeyBytes || mem.edSk // support old shape
  sodium.crypto_sign_detached(signature, transcript, privateKey)

  // Create session
  const { sessionId } = createSession(sharedSecret, transcript)

  return {
    hostEphemeralPubB64: Buffer.from(hostEphemeralPublicKey).toString('base64'),
    signatureB64: Buffer.from(signature).toString('base64'),
    sessionId
  }
}

/**
 * Validate and record an incoming sequence number.
 * Ensures strictly increasing sequence numbers to prevent replays within session.
 * @param {string} sessionId
 * @param {number} seq
 */
export const recordIncomingSeq = (sessionId, seq) => {
  const session = getSession(sessionId)
  if (!session) throw new Error('SessionNotFound')
  if (typeof seq !== 'number' || !Number.isFinite(seq))
    throw new Error('InvalidSeq')
  if (seq <= session.lastRecvSeq) throw new Error('ReplayDetected')
  session.lastRecvSeq = seq
}
