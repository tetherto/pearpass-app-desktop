import { randomBytes } from 'crypto'

import { jest } from '@jest/globals'
import Swarmconf from '@tetherto/swarmconf'
import Autopass from 'autopass'
import Corestore from 'corestore'

import { PearPassPairer } from './pearpassPairer'

// Mock the native modules before importing anything that depends on them
jest.mock('autopass', () => ({
  __esModule: true,
  default: {
    pair: jest.fn()
  }
}))

jest.mock('corestore', () => jest.fn())

jest.mock('@tetherto/swarmconf', () =>
  jest.fn().mockImplementation(() => ({
    ready: jest.fn().mockResolvedValue(undefined),
    current: {
      blindRelays: []
    }
  }))
)

describe('PearPassPairer', () => {
  let pairer
  let mockStore
  let mockInstance
  let mockPair
  let mockSwarmconf

  beforeEach(() => {
    jest.clearAllMocks()

    mockInstance = {
      ready: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      encryptionKey: randomBytes(32)
    }

    mockPair = {
      finished: jest.fn().mockResolvedValue(mockInstance)
    }

    Autopass.pair.mockReturnValue(mockPair)

    mockStore = {
      close: jest.fn().mockResolvedValue(undefined)
    }
    Corestore.mockImplementation(() => mockStore)

    mockSwarmconf = {
      ready: jest.fn().mockResolvedValue(undefined),
      current: {
        blindRelays: []
      }
    }
    Swarmconf.mockImplementation(() => mockSwarmconf)

    pairer = new PearPassPairer()
  })

  describe('pairInstance', () => {
    const path = '/fake/path'
    const invite = 'test-invite'

    it('should successfully pair an instance and return the base64 encryption key', async () => {
      const expectedKey = mockInstance.encryptionKey.toString('base64')

      const result = await pairer.pairInstance(path, invite)

      expect(Corestore).toHaveBeenCalledWith(path)
      expect(Autopass.pair).toHaveBeenCalledWith(mockStore, invite, {
        relayThrough: []
      })
      expect(mockPair.finished).toHaveBeenCalled()
      expect(mockInstance.ready).toHaveBeenCalled()
      expect(mockInstance.close).toHaveBeenCalled()
      expect(pairer.store).toBeNull()
      expect(result).toBe(expectedKey)
    })

    it('should throw an error if the store fails to create', async () => {
      Corestore.mockImplementation(() => {
        throw new Error('Error creating store')
      })

      await expect(pairer.pairInstance(path, invite)).rejects.toThrow(
        'Error creating store'
      )
    })

    it('should propagate errors from pair.finished()', async () => {
      const pairingError = new Error('Pairing failed')
      mockPair.finished.mockRejectedValue(pairingError)

      await expect(pairer.pairInstance(path, invite)).rejects.toThrow(
        'Pairing failed'
      )
    })

    it('should propagate errors from instance.ready()', async () => {
      const readyError = new Error('Instance not ready')
      mockInstance.ready.mockRejectedValue(readyError)

      await expect(pairer.pairInstance(path, invite)).rejects.toThrow(
        'Instance not ready'
      )
    })

    it('should propagate errors from instance.close()', async () => {
      const closeError = new Error('Failed to close instance')
      mockInstance.close.mockRejectedValue(closeError)

      await expect(pairer.pairInstance(path, invite)).rejects.toThrow(
        'Failed to close instance'
      )
    })
  })
})
