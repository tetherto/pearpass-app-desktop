// App identity utilities for Native Messaging secure pairing
// Generates long-term Ed25519 (signing) and X25519 (ECDH) keypairs.
// Private keys are stored via pearpass client's encryption* APIs.

import sodium from 'sodium-native'

import { clearAllSessions } from './sessionStore.js'
import { logger } from '../../utils/logger.js'

const ENC_KEY_ED25519 = 'nm.identity.ed25519'
const ENC_KEY_X25519 = 'nm.identity.x25519'
const ENC_KEY_CREATION_DATE = 'nm.identity.creationDate'
const ENC_KEY_CLIENT_ED25519_PUB = 'nm.client.identity.ed25519Pub'
const ENC_KEY_PAIRING_SECRET = 'nm.identity.pairingSecret'
const PAIRING_CODE_TAG = Buffer.from('pearpass/pairingcode/v1', 'utf8')

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
 * Load or create the pairing secret used for pairing token derivation.
 * @param {import('pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<string>} base64-encoded secret
 */
const getOrCreatePairingSecret = async (client) => {
  let pairingSecretB64 = normalizeEncryptionGet(
    await client.encryptionGet(ENC_KEY_PAIRING_SECRET).catch(() => null)
  )
  if (pairingSecretB64) {
    const bytes = Buffer.from(pairingSecretB64, 'base64')
    if (bytes.length !== 32) {
      throw new Error('InvalidPairingSecret')
    }
  }

  if (!pairingSecretB64) {
    const secretBytes = new Uint8Array(32)
    sodium.randombytes_buf(secretBytes)
    pairingSecretB64 = Buffer.from(secretBytes).toString('base64')
    try {
      await client.encryptionAdd(ENC_KEY_PAIRING_SECRET, pairingSecretB64)
    } catch (err) {
      throw new Error(
        `PairingSecretPersistenceFailed: ${err?.message || 'Unknown error'}`
      )
    }
  }

  return pairingSecretB64
}

/**
 * Create or load the long-term identity keypairs.
 * @param {import('pearpass-lib-vault-core').PearpassVaultClient} client
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

  // Ensure there is a pairing secret associated with this identity
  try {
    await getOrCreatePairingSecret(client)
  } catch {
    // Non-fatal: pairing token can be generated later when storage is available
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
 * Compute a pairing token from Ed25519 public key and a secret
 * using SHA-256 over secret || publicKey.
 * Format: XXXXXX-YYYY where XXXXXX is a 6-digit code and YYYY is 4 hex chars.
 * @param {string} ed25519PublicKeyB64
 * @param {string} pairingSecretB64
 * @returns {string}
 */
export const getPairingCode = (ed25519PublicKeyB64, pairingSecretB64) => {
  const secret = fromBase64(pairingSecretB64)
  const publicKey = fromBase64(ed25519PublicKeyB64)
  // Compute H = SHA-256(tag || secret || publicKey) for domain separation
  const input = new Uint8Array(
    PAIRING_CODE_TAG.length + secret.length + publicKey.length
  )
  input.set(PAIRING_CODE_TAG, 0)
  input.set(secret, PAIRING_CODE_TAG.length)
  input.set(publicKey, PAIRING_CODE_TAG.length + secret.length)
  input.set(publicKey, secret.length)

  const out = new Uint8Array(32)
  sodium.crypto_hash_sha256(out, input)

  // First 4 bytes → 6-digit code
  const num = Buffer.from(out.slice(0, 4)).readUInt32BE(0)
  const code = (num % 1000000).toString().padStart(6, '0')

  // Next 2 bytes → 4 hex chars as suffix
  const suffix = Buffer.from(out.slice(4, 6)).toString('hex').toUpperCase()

  return `${code}-${suffix}`
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
 * Derive the pairing token for the given identity from the stored pairing secret.
 * @param {import('pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} ed25519PublicKeyB64
 * @returns {Promise<string>}
 */
export const getPairingToken = async (client, ed25519PublicKeyB64) => {
  const pairingSecretB64 = await getOrCreatePairingSecret(client)
  return getPairingCode(ed25519PublicKeyB64, pairingSecretB64)
}

/**
 * Verify a pairing token against the expected value derived from the stored secret.
 * @param {import('pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} ed25519PublicKeyB64
 * @param {string} userProvidedToken
 * @returns {Promise<boolean>}
 */
export const verifyPairingToken = async (
  client,
  ed25519PublicKeyB64,
  userProvidedToken
) => {
  if (!userProvidedToken || typeof userProvidedToken !== 'string') {
    return false
  }

  const expectedToken = await getPairingToken(client, ed25519PublicKeyB64)

  // Case-insensitive comparison
  return userProvidedToken.toUpperCase() === expectedToken.toUpperCase()
}

/**
 * Reset the app identity by deleting existing keys and generating new ones
 * This will unpair any connected extensions
 * @param {import('pearpass-lib-vault-core').PearpassVaultClient} client
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
    await client.encryptionAdd(ENC_KEY_CLIENT_ED25519_PUB, '').catch(() => {})
    await client.encryptionAdd(ENC_KEY_PAIRING_SECRET, '').catch(() => {})

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

/**
 * Store client (extension) Ed25519 public key.
 * @param {import('pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} ed25519PublicKeyB64
 */
export const setClientIdentityPublicKey = async (
  client,
  ed25519PublicKeyB64
) => {
  if (!ed25519PublicKeyB64) {
    throw new Error('MissingClientPublicKey')
  }
  await client.encryptionAdd(ENC_KEY_CLIENT_ED25519_PUB, ed25519PublicKeyB64)
}

/**
 * Load client (extension) Ed25519 public key if present.
 * @param {import('pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<string|null>}
 */
export const getClientIdentityPublicKey = async (client) =>
  normalizeEncryptionGet(
    await client.encryptionGet(ENC_KEY_CLIENT_ED25519_PUB).catch(() => null)
  )
