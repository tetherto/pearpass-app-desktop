import { createRecord } from './createRecord'
import { pearpassVaultClient } from '../instances'

describe('createRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call activeVaultAdd with correct parameters', async () => {
    const record = {
      id: 'test-id',
      vaultId: 'test-vault-id'
    }

    await createRecord(record)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `record/${record.id}`,
      record
    )
  })

  it('should throw an error when activeVaultAdd fails', async () => {
    const record = {
      id: 'test-id',
      vaultId: 'test-vault-id'
    }

    const error = new Error('Failed to add record')
    pearpassVaultClient.activeVaultAdd.mockRejectedValueOnce(error)

    await expect(createRecord(record)).rejects.toThrow(error)
  })
})
