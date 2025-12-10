import { setPearpassVaultClient } from '../instances'
import { addBlindMirrors } from './addBlindMirrors'

describe('addBlindMirrors API', () => {
  beforeEach(() => {
    setPearpassVaultClient({
      addBlindMirrors: jest.fn().mockResolvedValue(undefined)
    })
  })

  it('throws on invalid input', async () => {
    await expect(addBlindMirrors([])).rejects.toThrow(
      '[addBlindMirrors]: No blind mirrors provided!'
    )
    await expect(addBlindMirrors(null)).rejects.toThrow(
      '[addBlindMirrors]: No blind mirrors provided!'
    )
  })

  it('calls client.addBlindMirrors for valid input', async () => {
    await expect(addBlindMirrors(['k1', 'k2'])).resolves.toBeUndefined()
  })
})
