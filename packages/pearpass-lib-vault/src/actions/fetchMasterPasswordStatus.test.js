import { fetchMasterPasswordStatus } from './fetchMasterPasswordStatus'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    getMasterPasswordStatus: jest.fn()
  }
}))

describe('fetchMasterPasswordStatus', () => {
  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should return master password status from pearpassVaultClient', async () => {
    const mockStatus = { isLocked: false, remainingAttempts: 5 }
    pearpassVaultClient.getMasterPasswordStatus.mockResolvedValue(mockStatus)

    const thunk = fetchMasterPasswordStatus()
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual(mockStatus)
    expect(pearpassVaultClient.getMasterPasswordStatus).toHaveBeenCalled()
  })

  it('should handle errors properly', async () => {
    const errorMessage = 'Failed to fetch status'
    pearpassVaultClient.getMasterPasswordStatus.mockRejectedValue(
      new Error(errorMessage)
    )

    const thunk = fetchMasterPasswordStatus()
    const result = await thunk(dispatch, getState)

    expect(result.type).toBe(fetchMasterPasswordStatus.rejected.type)
    expect(result.error.message).toBe(errorMessage)
  })
})
