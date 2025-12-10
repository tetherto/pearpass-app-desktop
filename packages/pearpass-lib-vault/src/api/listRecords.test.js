import { listRecords } from './listRecords'
import { pearpassVaultClient } from '../instances'

describe('listRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call activeVaultList with correct path', async () => {
    const mockRecords = [{ id: '1' }, { id: '2' }]
    pearpassVaultClient.activeVaultList.mockResolvedValueOnce(mockRecords)

    const result = await listRecords()

    expect(pearpassVaultClient.activeVaultList).toHaveBeenCalledWith('record/')
    expect(pearpassVaultClient.activeVaultList).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockRecords)
  })

  it('should propagate errors', async () => {
    const mockError = new Error('API error')
    pearpassVaultClient.activeVaultList.mockRejectedValueOnce(mockError)

    await expect(listRecords()).rejects.toThrow(mockError)
    expect(pearpassVaultClient.activeVaultList).toHaveBeenCalledWith('record/')
  })
})
