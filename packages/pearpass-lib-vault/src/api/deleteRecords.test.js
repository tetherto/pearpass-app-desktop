import { deleteRecords } from './deleteRecords'
import { pearpassVaultClient } from '../instances'

describe('deleteRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call activeVaultRemove with the correct path', async () => {
    const recordIds = ['record-123']

    await deleteRecords(recordIds)

    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledWith(
      'record/record-123'
    )
  })

  it('should throw an error if activeVaultRemove fails', async () => {
    const recordIds = ['record-456']
    const error = new Error('Failed to delete record')
    pearpassVaultClient.activeVaultRemove.mockRejectedValueOnce(error)

    await expect(deleteRecords(recordIds)).rejects.toThrow(error)
  })

  it('should throw an error if recordIds is not provided', async () => {
    await expect(deleteRecords()).rejects.toThrow('Record IDs is required')
  })
})
