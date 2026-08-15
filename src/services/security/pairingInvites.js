// One-time pairing invitations for Native Messaging.
//
// Each invitation carries its own random secret. The code shown to the user is
// derived from that secret plus the host identity public key, so it stays
// stable for as long as the invitation lives (the pairing modal can be
// reopened) while still being single-use: an invitation records which client
// consumed it and is never accepted again.

import sodium from 'sodium-native'

import { getPairingCode } from './appIdentity.js'
import { logger } from '../../utils/logger.js'

const ENC_KEY_INVITES = 'nm.pairing.invites'

const DOCUMENT_VERSION = 1

/** Invitations are valid for 10 minutes after they are minted. */
export const INVITE_TTL_MS = 10 * 60 * 1000

/** @typedef {{ id: string, secretB64: string, label: string, createdAt: string, expiresAt: string, consumedBy: string|null }} Invite */

/**
 * Serializes read-modify-write cycles on the invites document so two
 * concurrent pairings cannot clobber each other's changes.
 * @type {Promise<unknown>}
 */
let writeChain = Promise.resolve()

/**
 * Normalize encryptionGet return shape to a string or null.
 * Some client implementations return a string, others `{ data }`.
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
 * @param {Invite} invite
 * @param {number} now
 * @returns {boolean}
 */
const isLive = (invite, now) =>
  !invite.consumedBy && new Date(invite.expiresAt).getTime() > now

/**
 * Read the invites document, dropping anything expired or already consumed.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<Invite[]>}
 */
const readLiveInvites = async (client) => {
  const raw = normalize(
    await client.encryptionGet(ENC_KEY_INVITES).catch(() => null)
  )
  if (!raw) return []

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    logger.error(
      'PAIRING-INVITES',
      'Invites document is not valid JSON, treating as empty'
    )
    return []
  }

  if (!Array.isArray(parsed?.invites)) return []

  const now = Date.now()
  return parsed.invites.filter(
    (invite) => invite?.id && invite?.secretB64 && isLive(invite, now)
  )
}

/**
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {Invite[]} invites
 */
const writeInvites = async (client, invites) => {
  await client.encryptionAdd(
    ENC_KEY_INVITES,
    JSON.stringify({ version: DOCUMENT_VERSION, invites })
  )
}

/**
 * Run a read-modify-write cycle against the invites document, serialized
 * against every other mutation of the same document.
 * @template T
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {(invites: Invite[]) => { invites: Invite[], result: T }} mutate
 * @returns {Promise<T>}
 */
const withInvites = (client, mutate) => {
  const run = writeChain.then(async () => {
    const current = await readLiveInvites(client)
    const { invites, result } = mutate(current)
    await writeInvites(client, invites)
    return result
  })
  // Keep the chain alive even when this cycle rejects.
  writeChain = run.catch(() => {})
  return run
}

/**
 * Create a new single-use invitation.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} label - User-chosen name for the browser being paired
 * @returns {Promise<Invite>}
 */
export const mintInvite = async (client, label) => {
  const idBytes = Buffer.alloc(8)
  sodium.randombytes_buf(idBytes)
  const secretBytes = Buffer.alloc(32)
  sodium.randombytes_buf(secretBytes)

  const createdAt = Date.now()
  /** @type {Invite} */
  const invite = {
    id: idBytes.toString('hex'),
    secretB64: secretBytes.toString('base64'),
    label,
    createdAt: new Date(createdAt).toISOString(),
    expiresAt: new Date(createdAt + INVITE_TTL_MS).toISOString(),
    consumedBy: null
  }

  await withInvites(client, (invites) => ({
    invites: [...invites, invite],
    result: invite
  }))

  logger.info('PAIRING-INVITES', `Minted pairing invite ${invite.id}`)

  return invite
}

/**
 * Derive the user-facing code for an invitation.
 * @param {string} hostEd25519PublicKeyB64
 * @param {Invite} invite
 * @returns {string}
 */
export const getInviteCode = (hostEd25519PublicKeyB64, invite) =>
  getPairingCode(hostEd25519PublicKeyB64, invite.secretB64)

/**
 * Find a live invitation matching a user-entered code.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} hostEd25519PublicKeyB64
 * @param {string} code
 * @returns {Promise<Invite|null>}
 */
export const findLiveInviteByCode = async (
  client,
  hostEd25519PublicKeyB64,
  code
) => {
  if (!code || typeof code !== 'string') return null
  const normalizedCode = code.toUpperCase()
  const invites = await readLiveInvites(client)
  return (
    invites.find(
      (invite) =>
        getInviteCode(hostEd25519PublicKeyB64, invite).toUpperCase() ===
        normalizedCode
    ) || null
  )
}

/**
 * Mark an invitation as used by a specific client.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @param {string} inviteId
 * @param {string} clientEd25519PublicKeyB64
 * @returns {Promise<void>}
 */
export const consumeInvite = async (
  client,
  inviteId,
  clientEd25519PublicKeyB64
) => {
  await withInvites(client, (invites) => ({
    // A consumed invite is no longer live, so it drops out on the next read.
    invites: invites.map((invite) =>
      invite.id === inviteId
        ? { ...invite, consumedBy: clientEd25519PublicKeyB64 }
        : invite
    ),
    result: undefined
  }))

  logger.info('PAIRING-INVITES', `Consumed pairing invite ${inviteId}`)
}

/**
 * List invitations that can still be used.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<Invite[]>}
 */
export const listLiveInvites = (client) => readLiveInvites(client)

/**
 * Drop every invitation. Used when the integration is turned off entirely.
 * @param {import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient} client
 * @returns {Promise<void>}
 */
export const clearInvites = async (client) => {
  await withInvites(client, () => ({ invites: [], result: undefined }))
}
