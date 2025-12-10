import { selectVault } from './selectVault'

describe('selectVault', () => {
  test('should return vault from state', () => {
    const mockVault = { items: [], categories: [] }
    const mockState = { vault: mockVault }

    expect(selectVault(mockState)).toBe(mockVault)
  })

  test('should return undefined when state is null', () => {
    expect(selectVault(null)).toBeUndefined()
  })

  test('should return undefined when vault is not in state', () => {
    const mockState = { other: 'data' }

    expect(selectVault(mockState)).toBeUndefined()
  })
})
