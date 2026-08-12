jest.mock('sodium-native', () => ({
  crypto_sign_SECRETKEYBYTES: 64,
  crypto_sign_PUBLICKEYBYTES: 32,
  crypto_box_SECRETKEYBYTES: 32,
  crypto_box_PUBLICKEYBYTES: 32,
  randombytes_buf: jest.fn((buffer) => buffer.fill(1)),
  crypto_hash_sha256: jest.fn((out) => out.fill(2))
}))

import {
  addPendingClient,
  clearClients,
  confirmClient,
  getCachedClientPublicKeys,
  getClient,
  listClients,
  listConfirmedClients,
  removeClient
} from './pairedClients'
import { INVITE_TTL_MS } from './pairingInvites'
import { LOCAL_STORAGE_KEYS } from '../../constants/localStorage'
import { PAIRING_STATES } from '../../constants/pairing'
import { SecurityErrorCodes } from '../../constants/securityErrors'

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn() }
}))

const createStore = () => {
  const data = new Map()
  return {
    data,
    encryptionGet: jest.fn(async (key) => data.get(key) ?? null),
    encryptionAdd: jest.fn(async (key, value) => {
      data.set(key, value)
    })
  }
}

describe('pairedClients', () => {
  let client

  beforeEach(() => {
    client = createStore()
    localStorage.clear()
  })

  describe('registry', () => {
    it('starts empty', async () => {
      expect(await listClients(client)).toEqual([])
    })

    it('registers a pending client', async () => {
      const pending = await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: 'Chrome',
        inviteId: 'invite-1'
      })

      expect(pending.pairingState).toBe(PAIRING_STATES.PENDING)
      expect(await listClients(client)).toHaveLength(1)
      // Not usable for a secure channel until it confirms
      expect(await listConfirmedClients(client)).toHaveLength(0)
    })

    it('rejects a client with no public key', async () => {
      await expect(
        addPendingClient(client, { publicKey: '', label: 'Chrome' })
      ).rejects.toThrow(SecurityErrorCodes.MISSING_CLIENT_PUBLIC_KEY)
    })

    it('falls back to a generic label', async () => {
      const pending = await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: '',
        inviteId: null
      })

      expect(pending.label).toBe('Browser')
    })

    it('confirms a pending client and caches its key', async () => {
      await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: 'Chrome',
        inviteId: 'invite-1'
      })

      const confirmed = await confirmClient(client, 'chromeKey')

      expect(confirmed.pairingState).toBe(PAIRING_STATES.CONFIRMED)
      expect(await listConfirmedClients(client)).toHaveLength(1)
      expect(getCachedClientPublicKeys()).toEqual(['chromeKey'])
    })

    it('refuses to confirm a client that was never registered', async () => {
      await expect(confirmClient(client, 'strangerKey')).rejects.toThrow(
        SecurityErrorCodes.NO_PENDING_PAIRING
      )
    })

    it('holds several browsers at once', async () => {
      await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: 'Chrome',
        inviteId: 'invite-1'
      })
      await confirmClient(client, 'chromeKey')
      await addPendingClient(client, {
        publicKey: 'firefoxKey',
        label: 'Firefox',
        inviteId: 'invite-2'
      })
      await confirmClient(client, 'firefoxKey')

      expect(await listConfirmedClients(client)).toHaveLength(2)
      expect(getCachedClientPublicKeys()).toEqual(['chromeKey', 'firefoxKey'])
    })

    it('removes one browser and leaves the others paired', async () => {
      await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: 'Chrome',
        inviteId: 'invite-1'
      })
      await confirmClient(client, 'chromeKey')
      await addPendingClient(client, {
        publicKey: 'firefoxKey',
        label: 'Firefox',
        inviteId: 'invite-2'
      })
      await confirmClient(client, 'firefoxKey')

      expect(await removeClient(client, 'chromeKey')).toBe(true)

      const remaining = await listClients(client)
      expect(remaining).toHaveLength(1)
      expect(remaining[0].publicKey).toBe('firefoxKey')
      expect(getCachedClientPublicKeys()).toEqual(['firefoxKey'])
    })

    it('reports when there was nothing to remove', async () => {
      expect(await removeClient(client, 'strangerKey')).toBe(false)
    })

    it('looks a client up by key', async () => {
      await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: 'Chrome',
        inviteId: 'invite-1'
      })

      expect((await getClient(client, 'chromeKey'))?.label).toBe('Chrome')
      expect(await getClient(client, 'strangerKey')).toBeNull()
    })

    it('clears every browser', async () => {
      await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: 'Chrome',
        inviteId: 'invite-1'
      })
      await confirmClient(client, 'chromeKey')

      await clearClients(client)

      expect(await listClients(client)).toEqual([])
      expect(getCachedClientPublicKeys()).toEqual([])
    })

    it('serializes concurrent registrations so none are lost', async () => {
      await Promise.all([
        addPendingClient(client, {
          publicKey: 'chromeKey',
          label: 'Chrome',
          inviteId: 'a'
        }),
        addPendingClient(client, {
          publicKey: 'firefoxKey',
          label: 'Firefox',
          inviteId: 'b'
        }),
        addPendingClient(client, {
          publicKey: 'edgeKey',
          label: 'Edge',
          inviteId: 'c'
        })
      ])

      expect(await listClients(client)).toHaveLength(3)
    })

    it('drops a pending pairing that was never confirmed', async () => {
      await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: 'Chrome',
        inviteId: 'invite-1'
      })

      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + INVITE_TTL_MS + 1000)

      expect(await listClients(client)).toEqual([])

      jest.restoreAllMocks()
    })

    it('keeps a confirmed pairing indefinitely', async () => {
      await addPendingClient(client, {
        publicKey: 'chromeKey',
        label: 'Chrome',
        inviteId: 'invite-1'
      })
      await confirmClient(client, 'chromeKey')

      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + INVITE_TTL_MS * 1000)

      expect(await listClients(client)).toHaveLength(1)

      jest.restoreAllMocks()
    })

    it('treats a corrupt document as empty', async () => {
      client.data.set('nm.clients', 'not json')

      expect(await listClients(client)).toEqual([])
    })
  })

  describe('migration from the single-pairing era', () => {
    it('adopts an existing confirmed pairing', async () => {
      client.data.set(
        'nm.client.data',
        JSON.stringify({
          publicKey: 'legacyKey',
          pairingState: PAIRING_STATES.CONFIRMED
        })
      )
      client.data.set('nm.identity.creationDate', '2026-01-01T00:00:00.000Z')

      const clients = await listClients(client)

      expect(clients).toHaveLength(1)
      expect(clients[0]).toMatchObject({
        publicKey: 'legacyKey',
        label: 'Browser',
        pairingState: PAIRING_STATES.CONFIRMED,
        pairedAt: '2026-01-01T00:00:00.000Z'
      })
    })

    it('ignores a pairing that never got confirmed', async () => {
      client.data.set(
        'nm.client.data',
        JSON.stringify({
          publicKey: 'legacyKey',
          pairingState: PAIRING_STATES.PENDING
        })
      )

      expect(await listClients(client)).toEqual([])
    })

    it('leaves the legacy document in place for rollback', async () => {
      const legacy = JSON.stringify({
        publicKey: 'legacyKey',
        pairingState: PAIRING_STATES.CONFIRMED
      })
      client.data.set('nm.client.data', legacy)

      await listClients(client)

      expect(client.data.get('nm.client.data')).toBe(legacy)
    })

    it('reads the old single-key localStorage cache', () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEY, 'legacyKey')

      expect(getCachedClientPublicKeys()).toEqual(['legacyKey'])
    })

    it('folds the old cached key into the array on the next write', async () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.NM_CLIENT_PUBLIC_KEY, 'legacyKey')

      await addPendingClient(client, {
        publicKey: 'firefoxKey',
        label: 'Firefox',
        inviteId: 'invite-2'
      })
      await confirmClient(client, 'firefoxKey')

      expect(getCachedClientPublicKeys()).toEqual(['legacyKey', 'firefoxKey'])
    })
  })
})
