import { selectVaults } from './selectVaults'

describe('selectVaults', () => {
  test('should return vaults from state', () => {
    const mockVaults = [
      { id: 1, name: 'Vault 1' },
      { id: 2, name: 'Vault 2' }
    ]
    const mockState = {
      vaults: mockVaults
    }

    expect(selectVaults(mockState)).toBe(mockVaults)
  })

  test('should return undefined if state is null', () => {
    expect(selectVaults(null)).toBeUndefined()
  })

  test('should return undefined if vaults is not in state', () => {
    const mockState = { otherData: 'something' }
    expect(selectVaults(mockState)).toBeUndefined()
  })
})
