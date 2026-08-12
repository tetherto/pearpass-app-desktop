jest.mock('sodium-native', () => {
  let counter = 0
  return {
    crypto_sign_SECRETKEYBYTES: 64,
    crypto_sign_PUBLICKEYBYTES: 32,
    crypto_box_SECRETKEYBYTES: 32,
    crypto_box_PUBLICKEYBYTES: 32,
    // Distinct bytes per call, so every invite gets its own secret
    randombytes_buf: jest.fn((buffer) => {
      counter += 1
      buffer.fill(counter % 256)
    }),
    // Deterministic, but sensitive to the whole input
    crypto_hash_sha256: jest.fn((out, input) => {
      let acc = 0
      for (let i = 0; i < input.length; i += 1) {
        acc = (acc + input[i] * (i + 1)) % 4294967296
      }
      for (let i = 0; i < out.length; i += 1) {
        out[i] = (acc + i * 31) % 256
        acc = Math.floor(acc / 2) + 7
      }
    })
  }
})

import {
  clearInvites,
  consumeInvite,
  findLiveInviteByCode,
  getInviteCode,
  listLiveInvites,
  mintInvite,
  INVITE_TTL_MS
} from './pairingInvites'

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn() }
}))

const HOST_PUB = Buffer.alloc(32, 3).toString('base64')

/**
 * Minimal stand-in for the encrypted key/value store.
 */
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

describe('pairingInvites', () => {
  let client

  beforeEach(() => {
    client = createStore()
  })

  it('mints an invite with a random secret and a TTL', async () => {
    const invite = await mintInvite(client, 'Chrome')

    expect(invite.label).toBe('Chrome')
    expect(invite.consumedBy).toBeNull()
    expect(Buffer.from(invite.secretB64, 'base64')).toHaveLength(32)

    const lifetime =
      new Date(invite.expiresAt).getTime() -
      new Date(invite.createdAt).getTime()
    expect(lifetime).toBe(INVITE_TTL_MS)
  })

  it('derives a stable code so the modal can be reopened', async () => {
    const invite = await mintInvite(client, 'Chrome')

    expect(getInviteCode(HOST_PUB, invite)).toBe(
      getInviteCode(HOST_PUB, invite)
    )
    expect(getInviteCode(HOST_PUB, invite)).toMatch(/^\d{6}-[0-9A-F]{4}$/)
  })

  it('gives different browsers different codes', async () => {
    const first = await mintInvite(client, 'Chrome')
    const second = await mintInvite(client, 'Firefox')

    expect(getInviteCode(HOST_PUB, first)).not.toBe(
      getInviteCode(HOST_PUB, second)
    )
  })

  it('finds a live invite by its code, case-insensitively', async () => {
    const invite = await mintInvite(client, 'Chrome')
    const code = getInviteCode(HOST_PUB, invite)

    const found = await findLiveInviteByCode(
      client,
      HOST_PUB,
      code.toLowerCase()
    )

    expect(found?.id).toBe(invite.id)
  })

  it('returns null for a code that was never minted', async () => {
    await mintInvite(client, 'Chrome')

    expect(
      await findLiveInviteByCode(client, HOST_PUB, '000000-0000')
    ).toBeNull()
  })

  it('refuses an invite that has already been consumed', async () => {
    const invite = await mintInvite(client, 'Chrome')
    const code = getInviteCode(HOST_PUB, invite)

    await consumeInvite(client, invite.id, 'chromeKey')

    expect(await findLiveInviteByCode(client, HOST_PUB, code)).toBeNull()
    expect(await listLiveInvites(client)).toHaveLength(0)
  })

  it('refuses an invite that has expired', async () => {
    const invite = await mintInvite(client, 'Chrome')
    const code = getInviteCode(HOST_PUB, invite)

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date(invite.expiresAt).getTime() + 1)

    expect(await findLiveInviteByCode(client, HOST_PUB, code)).toBeNull()

    jest.restoreAllMocks()
  })

  it('keeps other invites usable when one is consumed', async () => {
    const first = await mintInvite(client, 'Chrome')
    const second = await mintInvite(client, 'Firefox')

    await consumeInvite(client, first.id, 'chromeKey')

    const found = await findLiveInviteByCode(
      client,
      HOST_PUB,
      getInviteCode(HOST_PUB, second)
    )
    expect(found?.id).toBe(second.id)
  })

  it('serializes concurrent mints so none are lost', async () => {
    await Promise.all([
      mintInvite(client, 'Chrome'),
      mintInvite(client, 'Firefox'),
      mintInvite(client, 'Edge')
    ])

    expect(await listLiveInvites(client)).toHaveLength(3)
  })

  it('treats a corrupt document as empty', async () => {
    client.data.set('nm.pairing.invites', 'not json')

    expect(await listLiveInvites(client)).toEqual([])
  })

  it('clears every invite', async () => {
    await mintInvite(client, 'Chrome')
    await mintInvite(client, 'Firefox')

    await clearInvites(client)

    expect(await listLiveInvites(client)).toHaveLength(0)
  })
})
