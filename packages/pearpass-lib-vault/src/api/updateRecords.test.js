import { updateRecords } from './updateRecords'
import { pearpassVaultClient } from '../instances'

describe('updateRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call activeVaultAdd with the correct parameters', async () => {
    const records = [{ id: '123', vaultId: '456' }]
    pearpassVaultClient.activeVaultAdd.mockResolvedValueOnce()

    await updateRecords(records)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `record/${records[0].id}`,
      records[0]
    )
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(1)
  })

  it('should throw an error when activeVaultAdd fails', async () => {
    const records = [{ id: '123', vaultId: '456' }]
    const error = new Error('Failed to update record')
    pearpassVaultClient.activeVaultAdd.mockRejectedValueOnce(error)

    await expect(updateRecords(records)).rejects.toThrow(error)
  })

  it('should handle records with additional properties', async () => {
    const records = [
      {
        id: '123',
        vaultId: '456',
        name: 'Test Record',
        username: 'testuser',
        password: 'secret',
        url: 'https://example.com'
      }
    ]
    pearpassVaultClient.activeVaultAdd.mockResolvedValueOnce()

    await updateRecords(records)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `record/${records[0].id}`,
      records[0]
    )
  })

  it('should handle record with UUID format id', async () => {
    const records = [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        vaultId: '456'
      }
    ]
    pearpassVaultClient.activeVaultAdd.mockResolvedValueOnce()

    await updateRecords(records)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `record/${records[0].id}`,
      records[0]
    )
  })
})
