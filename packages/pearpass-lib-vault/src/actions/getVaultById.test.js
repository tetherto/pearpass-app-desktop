import { getVaultById } from './getVaultById'
import { getVaultById as getVaultByIdApi } from '../api/getVaultById'
import { listDevices } from '../api/listDevices'
import { listRecords } from '../api/listRecords'

jest.mock('../api/getVaultById', () => ({
  getVaultById: jest.fn()
}))

jest.mock('../api/listRecords', () => ({
  listRecords: jest.fn()
}))

jest.mock('../api/listDevices', () => ({
  listDevices: jest.fn()
}))

describe('getVaultById', () => {
  const mockVaultId = 'vault-123'
  const mockParams = { password: 'password123' }
  const mockArguments = { vaultId: mockVaultId, params: mockParams }
  const mockVault = { id: mockVaultId, name: 'Test Vault' }
  const mockRecords = [{ id: 'record-1' }, { id: 'record-2' }]
  const mockDevices = []

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
    getVaultByIdApi.mockResolvedValue(mockVault)
    listRecords.mockResolvedValue(mockRecords)
    listDevices.mockResolvedValue(mockDevices)
  })

  it('should call getVaultByIdApi with correct vaultId and params', async () => {
    const thunk = getVaultById(mockArguments)
    await thunk(dispatch, getState)

    expect(getVaultByIdApi).toHaveBeenCalledWith(mockVaultId, mockParams)
  })

  it('should call listRecords with vault id', async () => {
    const thunk = getVaultById(mockArguments)
    await thunk(dispatch, getState)

    expect(listRecords).toHaveBeenCalledWith(mockVaultId)
  })

  it('should call listDevices with vault id', async () => {
    const thunk = getVaultById(mockArguments)
    await thunk(dispatch, getState)

    expect(listDevices).toHaveBeenCalledWith(mockVaultId)
  })

  it('should return vault with records and devices', async () => {
    const thunk = getVaultById(mockArguments)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      ...mockVault,
      records: mockRecords,
      devices: mockDevices
    })
  })

  it('should handle empty records array', async () => {
    listRecords.mockResolvedValue(null)

    const thunk = getVaultById(mockArguments)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      ...mockVault,
      records: [],
      devices: mockDevices
    })
  })

  it('should handle empty devices array', async () => {
    listDevices.mockResolvedValue(null)

    const thunk = getVaultById(mockArguments)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      ...mockVault,
      records: mockRecords,
      devices: []
    })
  })

  it('should throw error when vaultId is not provided', async () => {
    const thunk = getVaultById()
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(getVaultById.rejected.type)
    expect(result.error.message).toContain('Vault ID is required')
  })

  it('should throw error when vault is not found', async () => {
    getVaultByIdApi.mockResolvedValue(null)

    const thunk = getVaultById(mockArguments)
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(getVaultById.rejected.type)
    expect(result.error.message).toContain('Vault not found')
  })

  it('should handle rejection when API call fails', async () => {
    const errorMessage = 'Failed to get vault'
    getVaultByIdApi.mockRejectedValue(new Error(errorMessage))

    const thunk = getVaultById(mockArguments)
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(getVaultById.rejected.type)
    expect(result.error.message).toContain(errorMessage)
  })
})
