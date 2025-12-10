import { setPearpassVaultClient } from '../instances'
import { removeBlindMirror } from './removeBlindMirror'

describe('removeBlindMirror API', () => {
  beforeEach(() => {
    setPearpassVaultClient({
      removeBlindMirror: jest.fn().mockResolvedValue(undefined)
    })
  })

  it('throws on invalid key', async () => {
    await expect(removeBlindMirror('')).rejects.toThrow(
      '[removeBlindMirror]: Blind mirror key is required!'
    )
  })

  it('calls client.removeBlindMirror for valid key', async () => {
    await expect(removeBlindMirror('k1')).resolves.toBeUndefined()
  })
})
