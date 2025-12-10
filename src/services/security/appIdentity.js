// App identity utilities for Native Messaging secure pairing
// Generates long-term Ed25519 (signing) and X25519 (ECDH) keypairs.
// Private keys are stored via pearpass client's encryption* APIs.

import sodium from 'sodium-native'

import { clearAllSessions } from './sessionStore.js'
import { logger } from '../../utils/logger.js'

const ENC_KEY_ED25519 = 'nm.identity.ed25519'
const ENC_KEY_X25519 = 'nm.identity.x25519'
const ENC_KEY_CREATION_DATE = 'nm.identity.creationDate'

// In-memory fallback cache if persistence is unavailable (e.g., before unlock)
// Structure: { ed25519PublicKeyBytes, ed25519PrivateKeyBytes, x25519PublicKeyBytes, x25519PrivateKeyBytes, creationDate }
let MEMORY_IDENTITY = null

/**
 * Normalize encryptionGet return shape to base64 string or null
 * Some client implementations return a string, others { data: string|null }.
 * @param {any} val
 * @returns {string|null}
 */
const normalizeEncryptionGet = (val) => {
  if (val === null || val === undefined) return null
  if (typeof val === 'string') return val || null
  if (typeof val === 'object' && typeof val.data !== 'undefined') {
    return val.data || null
  }
  return null
}

/**
 * Convert bytes to base64 (URL-safe=false)
 * @param {Uint8Array} bytes
 * @returns {string}
 */
const toBase64 = (bytes) => Buffer.from(bytes).toString('base64')

/**
 * @param {string} base64String
 * @returns {Uint8Array}
 */
const fromBase64 = (base64String) =>
  new Uint8Array(Buffer.from(base64String, 'base64'))

/**
 * Create or load the long-term identity keypairs.
 * @param {import('pearpass-lib-vault-mobile').PearpassVaultClient} client
 * @returns {Promise<{ ed25519PublicKey: string, x25519PublicKey: string, creationDate: string }>} base64-encoded public keys and creation date
 */
export const getOrCreateIdentity = async (client) => {
  // Always try to initialize encryption if not already done
  try {
    const statusResponse = await client.encryptionGetStatus()
    // The worklet returns { status: boolean }
    const initialized = statusResponse?.status === true
    if (!initialized) {
      logger.info('APP-IDENTITY', 'Encryption not initialized, initializing...')
      const initResult = await client.encryptionInit()
      logger.info(
        'APP-IDENTITY',
        `Encryption initialization result: ${JSON.stringify(initResult)}`
      )
    }
  } catch (err) {
    // If status check fails, try to initialize anyway
    logger.info(
      'APP-IDENTITY',
      `Status check failed, attempting initialization: ${err.message}`
    )
    try {
      const initResult = await client.encryptionInit()
      logger.info(
        'APP-IDENTITY',
        `Encryption initialization result: ${JSON.stringify(initResult)}`
      )
    } catch (initErr) {
      // Ignore if already initialized
      if (!initErr?.message?.includes('already initialized')) {
        logger.error(
          'APP-IDENTITY',
          `Failed to initialize encryption: ${initErr.message}`
        )
      }
    }
  }

  // Try load encrypted blobs first (normalize to base64 string)
  const ed25519BlobB64 = normalizeEncryptionGet(
    await client.encryptionGet(ENC_KEY_ED25519).catch(() => null)
  )
  const x25519BlobB64 = normalizeEncryptionGet(
    await client.encryptionGet(ENC_KEY_X25519).catch(() => null)
  )
  let creationDate = normalizeEncryptionGet(
    await client.encryptionGet(ENC_KEY_CREATION_DATE).catch(() => null)
  )

  // Fallback to in-memory cache if present
  if ((!ed25519BlobB64 || !x25519BlobB64) && MEMORY_IDENTITY) {
    return {
      ed25519PublicKey: toBase64(MEMORY_IDENTITY.ed25519PublicKeyBytes),
      x25519PublicKey: toBase64(MEMORY_IDENTITY.x25519PublicKeyBytes),
      creationDate: MEMORY_IDENTITY.creationDate || new Date().toISOString()
    }
  }

  /** @type {Uint8Array|null} */
  let ed25519PrivateKeyBytes = null
  /** @type {Uint8Array|null} */
  let ed25519PublicKeyBytes = null

  /** @type {Uint8Array|null} */
  let x25519PrivateKeyBytes = null
  /** @type {Uint8Array|null} */
  let x25519PublicKeyBytes = null

  // If missing, generate and store
  if (!ed25519BlobB64 || !x25519BlobB64) {
    // Ed25519 signing
    ed25519PrivateKeyBytes = new Uint8Array(sodium.crypto_sign_SECRETKEYBYTES)
    ed25519PublicKeyBytes = new Uint8Array(sodium.crypto_sign_PUBLICKEYBYTES)
    sodium.crypto_sign_keypair(ed25519PublicKeyBytes, ed25519PrivateKeyBytes)

    // X25519 (Curve25519) for ECDH
    x25519PrivateKeyBytes = new Uint8Array(sodium.crypto_box_SECRETKEYBYTES)
    x25519PublicKeyBytes = new Uint8Array(sodium.crypto_box_PUBLICKEYBYTES)
    sodium.crypto_box_keypair(x25519PublicKeyBytes, x25519PrivateKeyBytes)

    // Persist (private and public concatenated; client encrypts in storage)
    const payloadEd25519 = Buffer.concat([
      Buffer.from(ed25519PublicKeyBytes),
      Buffer.from(ed25519PrivateKeyBytes)
    ])
    const payloadX25519 = Buffer.concat([
      Buffer.from(x25519PublicKeyBytes),
      Buffer.from(x25519PrivateKeyBytes)
    ])

    // Store creation date
    creationDate = new Date().toISOString()

    let persisted = true
    try {
      await client.encryptionAdd(
        ENC_KEY_ED25519,
        payloadEd25519.toString('base64')
      )
    } catch {
      persisted = false
    }
    try {
      await client.encryptionAdd(
        ENC_KEY_X25519,
        payloadX25519.toString('base64')
      )
    } catch {
      persisted = false
    }
    try {
      await client.encryptionAdd(ENC_KEY_CREATION_DATE, creationDate)
    } catch {
      persisted = false
    }

    // If we couldn't persist yet (e.g., locked), keep in-memory so UI can show pairing
    if (!persisted) {
      MEMORY_IDENTITY = {
        ed25519PublicKeyBytes,
        ed25519PrivateKeyBytes,
        x25519PublicKeyBytes,
        x25519PrivateKeyBytes,
        creationDate
      }
    }
  } else {
    // Decode
    const ed25519Buffer = Buffer.from(ed25519BlobB64, 'base64')
    ed25519PublicKeyBytes = new Uint8Array(
      ed25519Buffer.slice(0, sodium.crypto_sign_PUBLICKEYBYTES)
    )
    ed25519PrivateKeyBytes = new Uint8Array(
      ed25519Buffer.slice(
        sodium.crypto_sign_PUBLICKEYBYTES,
        sodium.crypto_sign_PUBLICKEYBYTES + sodium.crypto_sign_SECRETKEYBYTES
      )
    )

    const x25519Buffer = Buffer.from(x25519BlobB64, 'base64')
    x25519PublicKeyBytes = new Uint8Array(
      x25519Buffer.slice(0, sodium.crypto_box_PUBLICKEYBYTES)
    )
    x25519PrivateKeyBytes = new Uint8Array(
      x25519Buffer.slice(
        sodium.crypto_box_PUBLICKEYBYTES,
        sodium.crypto_box_PUBLICKEYBYTES + sodium.crypto_box_SECRETKEYBYTES
      )
    )
  }

  // Return only public keys (base64) and creation date
  return {
    ed25519PublicKey: toBase64(ed25519PublicKeyBytes),
    x25519PublicKey: toBase64(x25519PublicKeyBytes),
    creationDate: creationDate || new Date().toISOString()
  }
}

/**
 * Compute a short fingerprint from Ed25519 public key (base64 input)
 * Uses SHA-256 and returns hex of first 20 bits as 5-digit code.
 * @param {string} ed25519PublicKeyB64
 * @returns {string}
 */
export const getPairingCode = (ed25519PublicKeyB64) => {
  const fingerprint = getFingerprint(ed25519PublicKeyB64)
  // Use first 5 bytes -> numeric short code (e.g., 6 digits)
  const firstBytes = Buffer.from(fingerprint.slice(0, 8), 'hex') // 4 bytes
  const num = firstBytes.readUInt32BE(0)
  const code = (num % 1000000).toString().padStart(6, '0')
  return code
}

/**
 * @param {string} ed25519PublicKeyB64
 * @returns {string} hex SHA-256 fingerprint
 */
export const getFingerprint = (ed25519PublicKeyB64) => {
  const publicKeyBytes = fromBase64(ed25519PublicKeyB64)
  const out = new Uint8Array(32)
  sodium.crypto_hash_sha256(out, publicKeyBytes)
  return Buffer.from(out).toString('hex')
}

/**
 * Verify a pairing token against the expected value
 * The pairing token is a combination of the pairing code and a portion of the fingerprint
 * Format: XXXXXX-YYYY where XXXXXX is the 6-digit pairing code and YYYY is fingerprint chars
 * @param {string} ed25519PublicKeyB64
 * @param {string} userProvidedToken
 * @returns {boolean}
 */
export const verifyPairingToken = (ed25519PublicKeyB64, userProvidedToken) => {
  if (!userProvidedToken || typeof userProvidedToken !== 'string') {
    return false
  }

  // Generate the expected token
  const pairingCode = getPairingCode(ed25519PublicKeyB64)
  const fingerprint = getFingerprint(ed25519PublicKeyB64)

  // Create a token format: pairing code + first 4 chars of fingerprint
  // This provides both user-friendly verification and cryptographic binding
  const expectedToken = `${pairingCode}-${fingerprint.slice(0, 4).toUpperCase()}`

  // Case-insensitive comparison
  return userProvidedToken.toUpperCase() === expectedToken
}

/**
 * Reset the app identity by deleting existing keys and generating new ones
 * This will unpair any connected extensions
 * @param {import('pearpass-lib-vault-mobile').PearpassVaultClient} client
 * @returns {Promise<{ ed25519PublicKey: string, x25519PublicKey: string, creationDate: string }>} new base64-encoded public keys and creation date
 */
export const resetIdentity = async (client) => {
  // First, clear all active sessions to immediately disconnect extension
  const clearedSessions = clearAllSessions()

  logger.info('APP-IDENTITY', `Cleared ${clearedSessions} active sessions`)

  try {
    // Clear existing keys from storage by overwriting with empty values
    // This removes them since getOrCreateIdentity will regenerate when missing
    await client.encryptionAdd(ENC_KEY_ED25519, '').catch(() => {})
    await client.encryptionAdd(ENC_KEY_X25519, '').catch(() => {})
    await client.encryptionAdd(ENC_KEY_CREATION_DATE, '').catch(() => {})

    logger.info('APP-IDENTITY', 'Cleared existing identity keys')
  } catch (err) {
    logger.error(
      'APP-IDENTITY',
      `Failed to clear existing keys: ${err.message}`
    )
  }

  // Clear in-memory cache
  MEMORY_IDENTITY = null

  // Generate new identity
  const newIdentity = await getOrCreateIdentity(client)

  logger.info('APP-IDENTITY', 'Generated new identity for pairing')

  return newIdentity
}

// Internal: expose in-memory identity for session fallback
// eslint-disable-next-line no-underscore-dangle
export const __getMemIdentity = () => MEMORY_IDENTITY
