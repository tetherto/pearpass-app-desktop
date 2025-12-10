import { getVaults } from './getVaults'
import { listVaults } from '../api/listVaults'

jest.mock('../api/listVaults', () => ({
  listVaults: jest.fn()
}))

describe('getVaults', () => {
  const mockVaults = [
    { id: 'vault-1', name: 'Vault 1' },
    { id: 'vault-2', name: 'Vault 2' }
  ]

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
    listVaults.mockResolvedValue(mockVaults)
  })

  it('should return vaults from listVaults API', async () => {
    const thunk = getVaults()
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual(mockVaults)
  })

  it('should call listVaults API', async () => {
    const thunk = getVaults()
    await thunk(dispatch, getState)

    expect(listVaults).toHaveBeenCalled()
  })

  it('should handle API errors properly', async () => {
    const errorMessage = 'Failed to fetch vaults'
    listVaults.mockRejectedValue(new Error(errorMessage))

    const thunk = getVaults()
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(getVaults.rejected.type)
    expect(result.error.message).toContain('Failed to fetch vaults')
  })
})
