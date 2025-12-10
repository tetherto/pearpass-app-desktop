import { createInvite } from './createInvite'
import { pearpassVaultClient } from '../instances'

describe('createInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call pearpassVaultClient.activeVaultCreateInvite', async () => {
    const mockInviteCode = 'test-invite-code-123'
    pearpassVaultClient.activeVaultCreateInvite.mockResolvedValue(
      mockInviteCode
    )

    const result = await createInvite()

    expect(pearpassVaultClient.activeVaultCreateInvite).toHaveBeenCalledTimes(1)
    expect(result).toBe(mockInviteCode)
  })

  it('should propagate errors from the client', async () => {
    const mockError = new Error('Failed to create invite')
    pearpassVaultClient.activeVaultCreateInvite.mockRejectedValue(mockError)

    await expect(createInvite()).rejects.toThrow(mockError)
    expect(pearpassVaultClient.activeVaultCreateInvite).toHaveBeenCalledTimes(1)
  })
})
