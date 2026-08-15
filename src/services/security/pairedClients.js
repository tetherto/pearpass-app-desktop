// Registry of browser extensions paired with this desktop app.
//
// Replaces the single pinned client that used to live in `nm.client.data`.
// The encryption store has no enumeration API, so the whole registry lives
// under one key as a JSON document.

import { INVITE_TTL_MS } from './pairingInvites.js'
import { LOCAL_STORAGE_KEYS } from '../../constants/localStorage.js'
import { PAIRING_STATES } from '../../constants/pairing.js'
import { SecurityErrorCodes } from '../../constants/securityErrors.js'
import { createErrorWithCode } from '../../utils/createErrorWithCode.js'
import { logger } from '../../utils/logger.js'

const ENC_KEY_CLIENTS = 'nm.clients'
/** Pre-multi-browser storage, read once to migrate the existing pairing. */
const ENC_KEY_LEGACY_CLIENT_DATA = 'nm.client.data'
const ENC_KEY_CREATION_DATE = 'nm.identity.creationDate'

const DOCUMENT_VERSION = 1

/** @typedef {{ publicKey: string, label: string, pairingState: string, pairedAt: string, inviteId: string|null }} PairedClient */

/**
 * Serializes read-modify-write cycles on the clients document so two
 * extensions confirming at the same time cannot clobber each other.
 * @type {Promise<unknown>}
 */
let writeChain = Promise.resolve()

/**
 * @param {any} value
 * @returns {string|null}
 */
const normalize = (value) => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value || null
  if (typeof value === 'object' && typeof value.data !== 'undefined') {
    return value.data || null
  }
  return null
}

/**
 * A pairing that was started but never confirmed expires with its invitation,
 * so a botched pairing does not leave a permanent row behind.
 * @param {PairedClient} entry
 * @param {number} now
 * @returns {boolean}
 */
const isStalePending = (entry, now) =>
  entry.pairingState !== PAIRING_STATES.CONFIRMED &&
  now - new Date(entry.pairedAt).getTime() > INVITE_TTL_MS

/**
 * Build the initial registry from the single pre-multi-browser pairing, if any.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<PairedClient[]>}
 */
const migrateLegacyClient = async (client) => {
  const raw = normalize(
    await client.encryptionGet(ENC_KEY_LEGACY_CLIENT_DATA).catch(() => null)
  )
  if (!raw) return []

  let legacy
  try {
    legacy = JSON.parse(raw)
  } catch {
    return []
  }

  if (!legacy?.publicKey || legacy.pairingState !== PAIRING_STATES.CONFIRMED) {
    return []
  }

  const creationDate =
    normalize(
      await client.encryptionGet(ENC_KEY_CREATION_DATE).catch(() => null)
    ) || new Date().toISOString()

  logger.info('PAIRED-CLIENTS', 'Migrated existing pairing into the registry')

  // The legacy document is left in place so a rollback still finds it.
  return [
    {
      publicKey: legacy.publicKey,
      label: 'Browser',
      pairingState: PAIRING_STATES.CONFIRMED,
      pairedAt: creationDate,
      inviteId: null
    }
  ]
}

/**
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<PairedClient[]>}
 */
const readClients = async (client) => {
  const raw = normalize(
    await client.encryptionGet(ENC_KEY_CLIENTS).catch(() => null)
  )

  if (!raw) return migrateLegacyClient(client)

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    logger.error(
      'PAIRED-CLIENTS',
      'Clients document is not valid JSON, treating as empty'
    )
    return []
  }

  if (!Array.isArray(parsed?.clients)) return []

  const now = Date.now()
  return parsed.clients.filter(
    (entry) => entry?.publicKey && !isStalePending(entry, now)
  )
}

/**
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {PairedClient[]} clients
 */
const writeClients = async (client, clients) => {
  await client.encryptionAdd(
    ENC_KEY_CLIENTS,
    JSON.stringify({ version: DOCUMENT_VERSION, clients })
  )
}

/**
 * Run a read-modify-write cycle against the registry, serialized against every
 * other mutation of the same document.
 * @template T
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {(clients: PairedClient[]) => { clients: PairedClient[], result: T }} mutate
 * @returns {Promise<T>}
 */
const withClients = (client, mutate) => {
  const run = writeChain.then(async () => {
    const current = await readClients(client)
    const { clients, result } = mutate(current)
    await writeClients(client, clients)
    return result
  })
  writeChain = run.catch(() => {})
  return run
}

/**
 * Every registered client, including pairings that are still pending.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<PairedClient[]>}
 */
export const listClients = (client) => readClients(client)

/**
 * Clients that completed pairing and may open a secure channel.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<PairedClient[]>}
 */
export const listConfirmedClients = async (client) => {
  const clients = await readClients(client)
  return clients.filter(
    (entry) => entry.pairingState === PAIRING_STATES.CONFIRMED
  )
}

/**
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} ed25519PublicKeyB64
 * @returns {Promise<PairedClient|null>}
 */
export const getClient = async (client, ed25519PublicKeyB64) => {
  const clients = await readClients(client)
  return (
    clients.find((entry) => entry.publicKey === ed25519PublicKeyB64) || null
  )
}

/**
 * Register a client that has redeemed an invitation but has not confirmed yet.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {{ publicKey: string, label: string, inviteId: string|null }} entry
 * @returns {Promise<PairedClient>}
 */
export const addPendingClient = async (
  client,
  { publicKey, label, inviteId }
) => {
  if (!publicKey) {
    throw new Error(
      createErrorWithCode(
        SecurityErrorCodes.MISSING_CLIENT_PUBLIC_KEY,
        'Client public key is required'
      )
    )
  }

  /** @type {PairedClient} */
  const pending = {
    publicKey,
    label: label || 'Browser',
    pairingState: PAIRING_STATES.PENDING,
    pairedAt: new Date().toISOString(),
    inviteId: inviteId || null
  }

  return withClients(client, (clients) => ({
    clients: [
      ...clients.filter((entry) => entry.publicKey !== publicKey),
      pending
    ],
    result: pending
  }))
}

/**
 * Promote a pending client to confirmed once it has proven it can decrypt.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} ed25519PublicKeyB64
 * @returns {Promise<PairedClient>}
 */
export const confirmClient = async (client, ed25519PublicKeyB64) => {
  const confirmed = await withClients(client, (clients) => {
    const existing = clients.find(
      (entry) => entry.publicKey === ed25519PublicKeyB64
    )

    if (!existing) {
      throw new Error(
        createErrorWithCode(
          SecurityErrorCodes.NO_PENDING_PAIRING,
          'No pending pairing found'
        )
      )
    }

    const updated = {
      ...existing,
      pairingState: PAIRING_STATES.CONFIRMED
    }

    return {
      clients: clients.map((entry) =>
        entry.publicKey === ed25519PublicKeyB64 ? updated : entry
      ),
      result: updated
    }
  })

  addCachedClientPublicKey(ed25519PublicKeyB64)

  return confirmed
}

/**
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} ed25519PublicKeyB64
 * @returns {Promise<boolean>} whether a client was actually removed
 */
export const removeClient = async (client, ed25519PublicKeyB64) => {
  const removed = await withClients(client, (clients) => ({
    clients: clients.filter((entry) => entry.publicKey !== ed25519PublicKeyB64),
    result: clients.some((entry) => entry.publicKey === ed25519PublicKeyB64)
  }))

  removeCachedClientPublicKey(ed25519PublicKeyB64)

  return removed
}

/**
 * Drop the whole registry. Used when the integration is turned off entirely.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<void>}
 */
export const clearClients = async (client) => {
  await withClients(client, () => ({ clients: [], result: undefined }))
  clearCachedClientPublicKeys()
}

/**
 * Confirmed client keys cached outside the vault.
 *
 * `checkExtensionPairingStatus` answers while the vault is still locked, so it
 * cannot read the encrypted registry.
 * @returns {string[]}
 */
export const getCachedClientPublicKeys = () => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEYS)

  if (!raw) {
    // Pre-multi-browser cache held a single bare key.
    const legacy = localStorage.getItem(LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEY)
    return legacy ? [legacy] : []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

/**
 * @param {string[]} keys
 */
const setCachedClientPublicKeys = (keys) => {
  localStorage.setItem(
    LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEYS,
    JSON.stringify(keys)
  )
}

/**
 * @param {string} ed25519PublicKeyB64
 */
const addCachedClientPublicKey = (ed25519PublicKeyB64) => {
  const keys = getCachedClientPublicKeys()
  if (keys.includes(ed25519PublicKeyB64)) return
  setCachedClientPublicKeys([...keys, ed25519PublicKeyB64])
}

/**
 * @param {string} ed25519PublicKeyB64
 */
const removeCachedClientPublicKey = (ed25519PublicKeyB64) => {
  setCachedClientPublicKeys(
    getCachedClientPublicKeys().filter((key) => key !== ed25519PublicKeyB64)
  )
  localStorage.removeItem(LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEY)
}

const clearCachedClientPublicKeys = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEYS)
  localStorage.removeItem(LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEY)
}
