/* eslint-disable no-underscore-dangle */
/* eslint-env jest */

import { createElectronVaultClientProxy } from './vaultClientProxy'

// Ensure btoa/atob exist in the Jest environment
if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (str) => Buffer.from(str, 'binary').toString('base64')
}
if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = (b64) => Buffer.from(b64, 'base64').toString('binary')
}

describe('createElectronVaultClientProxy', () => {
  let vaultInvoke
  let vaultOnUpdate
  let unsubscribe
  let updateCallback
  let client

  beforeEach(() => {
    vaultInvoke = jest.fn().mockResolvedValue({ ok: true, data: null })
    unsubscribe = jest.fn()
    updateCallback = null

    vaultOnUpdate = jest.fn((cb) => {
      updateCallback = cb
      return unsubscribe
    })

    const api = { vaultInvoke, vaultOnUpdate }
    client = createElectronVaultClientProxy(api)
  })

  test('subscribes to vaultOnUpdate and re-emits update events', () => {
    const handler = jest.fn()
    client.on('update', handler)

    expect(vaultOnUpdate).toHaveBeenCalledTimes(1)
    expect(typeof updateCallback).toBe('function')

    // Simulate an update from the main process
    updateCallback()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('creates proxy methods that forward to vaultInvoke', async () => {
    const args = [{ foo: 'bar' }, 42]

    await client.vaultsInit(...args)

    expect(vaultInvoke).toHaveBeenCalledTimes(1)
    const [method, forwardedArgs] = vaultInvoke.mock.calls[0]
    expect(method).toBe('vaultsInit')
    expect(forwardedArgs).toHaveLength(args.length)
    expect(forwardedArgs[0]).toEqual({ foo: 'bar' })
    expect(forwardedArgs[1]).toBe(42)
  })

  test('serializes buffer-like arguments to base64 objects', async () => {
    const bytes = Uint8Array.from([1, 2, 3, 4])

    await client.hashPassword(bytes)

    expect(vaultInvoke).toHaveBeenCalledTimes(1)
    const [method, forwardedArgs] = vaultInvoke.mock.calls[0]
    expect(method).toBe('hashPassword')

    const serialized = forwardedArgs[0]
    expect(serialized).toHaveProperty('__base64')

    const decoded = Buffer.from(serialized.__base64, 'base64')
    expect(Array.from(decoded)).toEqual([1, 2, 3, 4])
  })

  test('serializes nested objects and arrays containing buffer-like values', async () => {
    const payload = {
      meta: 'test',
      data: [Uint8Array.from([9, 8, 7])]
    }

    await client.encryptVaultWithKey(payload)

    const [method, forwardedArgs] = vaultInvoke.mock.calls[0]
    expect(method).toBe('encryptVaultWithKey')

    const serialized = forwardedArgs[0]
    expect(serialized.meta).toBe('test')
    expect(Array.isArray(serialized.data)).toBe(true)
    expect(serialized.data[0]).toHaveProperty('__base64')
  })

  test('deserializes base64 data from vaultInvoke into Buffer/Uint8Array', async () => {
    const bytes = Uint8Array.from([5, 6, 7])
    const base64 = Buffer.from(bytes).toString('base64')

    vaultInvoke.mockResolvedValueOnce({
      ok: true,
      data: { __base64: base64 }
    })

    const result = await client.getDecryptionKey('some-id')

    expect(vaultInvoke).toHaveBeenCalledWith(
      'getDecryptionKey',
      expect.any(Array)
    )
    expect(result instanceof Uint8Array || Buffer.isBuffer(result)).toBe(true)
    expect(Array.from(result)).toEqual([5, 6, 7])
  })

  test('throws an Error when vaultInvoke indicates failure and preserves error code', async () => {
    vaultInvoke.mockResolvedValueOnce({
      ok: false,
      error: 'Something went wrong',
      code: 'E_VAULT'
    })

    await expect(client.vaultsGetStatus()).rejects.toMatchObject({
      message: 'Something went wrong',
      code: 'E_VAULT'
    })
  })
})
