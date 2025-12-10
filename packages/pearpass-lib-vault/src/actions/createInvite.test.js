import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { createInvite, inviteSchema } from './createInvite'
import { createInvite as createInviteApi } from '../api/createInvite'
import { VERSION } from '../constants/version'

jest.mock('../api/createInvite', () => ({
  createInvite: jest.fn()
}))

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

describe('createInvite', () => {
  const mockVaultId = 'vault-123'
  const mockInviteId = 'invite-456'
  const mockPublicKey = 'public-key-abc'
  const mockDate = 1633000000000

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()

    global.Date.now = jest.fn().mockReturnValue(mockDate)

    generateUniqueId.mockReturnValue(mockInviteId)
    createInviteApi.mockResolvedValue(mockPublicKey)

    dispatch = jest.fn()
    getState = jest.fn().mockReturnValue({
      vault: {
        data: {
          id: mockVaultId
        }
      }
    })
  })

  it('should create an invite with correct properties', async () => {
    const thunk = createInvite()
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      id: mockInviteId,
      version: VERSION.v1,
      vaultId: mockVaultId,
      publicKey: mockPublicKey,
      createdAt: mockDate,
      expiresAt: mockDate
    })
  })

  it('should call createInviteApi', async () => {
    const thunk = createInvite()
    await thunk(dispatch, getState)

    expect(createInviteApi).toHaveBeenCalled()
  })

  it('should generate a unique ID for the invite', async () => {
    const thunk = createInvite()
    await thunk(dispatch, getState)

    expect(generateUniqueId).toHaveBeenCalled()
  })

  it('should throw an error if publicKey is not returned', async () => {
    createInviteApi.mockResolvedValue(null)

    const thunk = createInvite()

    const result = await thunk(dispatch, getState)

    expect(result.type).toBe(createInvite.rejected.type)
    expect(result.error.message).toBe('Failed to create invite')
  })

  it('should throw an error if invite validation fails', async () => {
    const originalValidate = inviteSchema.validate
    inviteSchema.validate = jest
      .fn()
      .mockReturnValue({ error: 'Validation error' })

    const thunk = createInvite()

    const result = await thunk(dispatch, getState)

    expect(result.type).toBe(createInvite.rejected.type)
    expect(result.error.message).toContain('Invalid invite data')

    inviteSchema.validate = originalValidate
  })
})
