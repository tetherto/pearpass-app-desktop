import { setPearpassVaultClient } from '../instances'
import { getBlindMirrors } from './getBlindMirrors'

describe('getBlindMirrors API', () => {
  beforeEach(() => {
    setPearpassVaultClient({
      getBlindMirrors: jest.fn().mockResolvedValue(['mirror1'])
    })
  })

  it('returns mirrors from client', async () => {
    const mirrors = await getBlindMirrors()
    expect(mirrors).toEqual(['mirror1'])
  })
})
