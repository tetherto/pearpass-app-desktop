import { pearpassVaultClient } from '../instances'
import { listDevices } from './listDevices'

describe('listDevices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call activeVaultList with correct path', async () => {
    const mockDevices = [{ id: '1' }, { id: '2' }]
    pearpassVaultClient.activeVaultList.mockResolvedValueOnce(mockDevices)

    const result = await listDevices()

    expect(pearpassVaultClient.activeVaultList).toHaveBeenCalledWith('device/')
    expect(pearpassVaultClient.activeVaultList).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockDevices)
  })

  it('should propagate errors', async () => {
    const mockError = new Error('API error')
    pearpassVaultClient.activeVaultList.mockRejectedValueOnce(mockError)

    await expect(listDevices()).rejects.toThrow(mockError)
    expect(pearpassVaultClient.activeVaultList).toHaveBeenCalledWith('device/')
  })
})
