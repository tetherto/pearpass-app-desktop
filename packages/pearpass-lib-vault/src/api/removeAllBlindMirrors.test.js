import { setPearpassVaultClient } from '../instances'
import { removeAllBlindMirrors } from './removeAllBlindMirrors'

describe('removeAllBlindMirrors API', () => {
  beforeEach(() => {
    setPearpassVaultClient({
      removeAllBlindMirrors: jest.fn().mockResolvedValue(undefined)
    })
  })

  it('calls client.removeAllBlindMirrors', async () => {
    await expect(removeAllBlindMirrors()).resolves.toBeUndefined()
  })
})
