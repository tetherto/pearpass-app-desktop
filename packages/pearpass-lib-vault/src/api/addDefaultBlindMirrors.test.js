import { setPearpassVaultClient } from '../instances'
import { addDefaultBlindMirrors } from './addDefaultBlindMirrors'

describe('addDefaultBlindMirrors API', () => {
  beforeEach(() => {
    setPearpassVaultClient({
      addDefaultBlindMirrors: jest.fn().mockResolvedValue(undefined)
    })
  })

  it('calls client.addDefaultBlindMirrors', async () => {
    await expect(addDefaultBlindMirrors()).resolves.toBeUndefined()
  })
})
