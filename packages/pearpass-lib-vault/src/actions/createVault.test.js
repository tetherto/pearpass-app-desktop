import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { createVault } from './createVault'
import { createProtectedVault } from '../api/createProtectedVault'
import { createUnprotectedVault } from '../api/createUnprotectedVault'
import { VERSION } from '../constants/version'

jest.mock('../api/createProtectedVault', () => ({
  createProtectedVault: jest.fn()
}))

jest.mock('../api/createUnprotectedVault', () => ({
  createUnprotectedVault: jest.fn()
}))

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

describe('createVault', () => {
  const mockVaultId = 'vault-123'
  const mockDate = 1633000000000
  const vaultName = 'vault1'

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()

    global.Date.now = jest.fn().mockReturnValue(mockDate)

    generateUniqueId.mockReturnValue(mockVaultId)

    dispatch = jest.fn()
    getState = jest.fn()

    createUnprotectedVault.mockResolvedValue({})
    createProtectedVault.mockResolvedValue({})
  })

  it('should create a vault with correct properties', async () => {
    const thunk = createVault({ name: vaultName })
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      id: mockVaultId,
      name: vaultName,
      version: VERSION.v1,
      records: [],
      devices: [],
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })

  it('should create a vault with password', async () => {
    const password = 'password123'

    const thunk = createVault({ name: vaultName, password: password })
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      id: mockVaultId,
      name: vaultName,
      version: VERSION.v1,
      records: [],
      devices: [],
      createdAt: mockDate,
      updatedAt: mockDate
    })

    expect(createProtectedVault).toHaveBeenCalled()
  })

  it('should call createUnprotectedVault when no password is provided', async () => {
    const thunk = createVault({ name: vaultName })
    await thunk(dispatch, getState)

    expect(createUnprotectedVault).toHaveBeenCalledWith({
      id: mockVaultId,
      name: vaultName,
      version: VERSION.v1,
      records: [],
      devices: [],
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })

  it('should generate a unique ID for the vault', async () => {
    const thunk = createVault({ name: vaultName })
    await thunk(dispatch, getState)

    expect(generateUniqueId).toHaveBeenCalled()
  })

  it('should throw an error if validation fails', async () => {
    global.Date.now = jest.fn().mockReturnValue(undefined)

    const thunk = createVault({ name: vaultName })
    const result = await thunk(dispatch, getState).catch((e) => e)
    expect(result.type).toBe(createVault.rejected.type)
    expect(result.error.message).toContain('Invalid vault data')
    expect(createUnprotectedVault).not.toHaveBeenCalled()
  })
})
