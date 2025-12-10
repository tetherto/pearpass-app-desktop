import id from 'hypercore-id-encoding'

import { getSharedDHT } from '../worklet/utils/dht'

/**
 * Attempt to validate a mirror key by connecting via DHT.
 * @param {string} key
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<boolean>}
 */

export const validateMirrorKeyViaDHT = async (key, options = {}) => {
  const { timeoutMs = 5000 } = options

  let decodedKey
  try {
    decodedKey = id.decode(key)
  } catch {
    return false
  }

  const dht = getSharedDHT()

  return new Promise((resolve) => {
    const socket = dht.connect(decodedKey)
    let resolved = false

    const resolveOnce = (success) => {
      if (resolved) return
      resolved = true

      try {
        socket.removeAllListeners()
        socket.destroy()
      } catch {}

      clearTimeout(timer)
      resolve(success)
    }

    // If no event is emitted, resolve with false after timeout
    const timer = setTimeout(() => resolveOnce(false), timeoutMs)

    socket.once('error', () => resolveOnce(false))
    socket.once('close', () => resolveOnce(false))
    socket.once('open', () => resolveOnce(true))
  })
}

/**
 * Filter a list of mirrors to those reachable via DHT
 * @param {Array<string>} mirrors
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<Array<string>>}
 */
export const filterReachableMirrors = async (mirrors, options = {}) => {
  if (!Array.isArray(mirrors) || mirrors.length === 0) return []

  const checks = await Promise.all(
    mirrors.map(async (key) => ({
      key,
      ok: await validateMirrorKeyViaDHT(key, options)
    }))
  )
  return checks.filter((c) => c.ok).map((c) => c.key)
}

/**
 * Middleware to validate mirrors via DHT before invoking provided action
 * @param {(mirrors: Array<string>) => Promise<any>} action
 * @param {{ timeoutMs?: number }} [options]
 * @returns {(mirrors: Array<string>) => Promise<any>}
 */
export const withMirrorValidation =
  (action, options = {}) =>
  async (mirrors) => {
    const valid = await filterReachableMirrors(mirrors, options)

    if (valid.length === 0) {
      throw new Error('No reachable mirrors')
    }

    return action(valid)
  }
