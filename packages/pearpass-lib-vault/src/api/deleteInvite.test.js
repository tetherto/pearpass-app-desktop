import { deleteInvite } from './deleteInvite.js'
import { pearpassVaultClient } from '../instances'

describe('deleteInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call pearpassVaultClient.activeVaultDeleteInvite', async () => {
    pearpassVaultClient.activeVaultDeleteInvite.mockResolvedValue(undefined)

    await deleteInvite()

    expect(pearpassVaultClient.activeVaultDeleteInvite).toHaveBeenCalledTimes(1)
  })

  it('should propagate errors from the client', async () => {
    const mockError = new Error('Failed to delete invite')
    pearpassVaultClient.activeVaultDeleteInvite.mockRejectedValue(mockError)

    await expect(deleteInvite()).rejects.toThrow(mockError)
    expect(pearpassVaultClient.activeVaultDeleteInvite).toHaveBeenCalledTimes(1)
  })
})
