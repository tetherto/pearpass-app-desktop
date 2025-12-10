import { pearpassVaultClient } from '../instances'
import { addDevice } from './addDevice'

describe('addDevice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call activeVaultAdd with correct parameters', async () => {
    const device = {
      id: 'test-id',
      vaultId: 'test-vault-id'
    }

    await addDevice(device)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `device/${device.id}`,
      device
    )
  })

  it('should throw an error when activeVaultAdd fails', async () => {
    const device = {
      id: 'test-id',
      vaultId: 'test-vault-id'
    }

    const error = new Error('Failed to add device')
    pearpassVaultClient.activeVaultAdd.mockRejectedValueOnce(error)

    await expect(addDevice(device)).rejects.toThrow(error)
  })
})
