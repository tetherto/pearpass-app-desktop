import { getConfig } from './utils/swarm'
import Autopass from 'autopass'
import Corestore from 'corestore'

export class PearPassPairer {
  constructor() {
    /**
     * @type {Corestore | null}
     */
    this.store = null
    /**
     * @type {any | null}
     */
    this.pair = null
  }

  async pairInstance(path, invite) {
    try {
      this.store = new Corestore(path)

      if (!this.store) {
        throw new Error('Error creating store')
      }

      const conf = await getConfig(this.store)

      this.pair = Autopass.pair(this.store, invite, {
        relayThrough: conf.current.blindRelays
      })

      const instance = await this.pair.finished()

      await instance.ready()

      await instance.close()

      this.store = null
      this.pair = null

      return instance.encryptionKey.toString('base64')
    } catch (error) {
      await this.cancelPairing()
      throw new Error(`Pairing failed: ${error.message}`)
    }
  }

  async cancelPairing() {
    const hadPair = !!this.pair
    if (this.pair) {
      try {
        await this.pair.close()
      } catch {
        // Ignore close errors
      }
      this.pair = null
    }
    // only close store if pair didn't exist (pair.close() already closes it)
    if (this.store && !hadPair) {
      try {
        await this.store.close()
      } catch {
        // Ignore close errors
      }
    }
    this.store = null
  }
}
