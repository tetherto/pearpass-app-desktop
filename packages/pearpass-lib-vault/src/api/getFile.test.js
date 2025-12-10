import { vaultGetFile } from './getFile'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetFile: jest.fn()
  }
}))

describe('getFile', () => {
  const mockKey = 'file-key-123'
  const mockResponse = { data: 'file-content' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw an error if key is not provided', async () => {
    await expect(vaultGetFile()).rejects.toThrow(
      'Key is required to get a file'
    )
    await expect(vaultGetFile(null)).rejects.toThrow(
      'Key is required to get a file'
    )
    await expect(vaultGetFile('')).rejects.toThrow(
      'Key is required to get a file'
    )
  })

  it('should call pearpassVaultClient.activeVaultGetFile with the provided key', async () => {
    pearpassVaultClient.activeVaultGetFile.mockResolvedValue(mockResponse)
    await vaultGetFile(mockKey)
    expect(pearpassVaultClient.activeVaultGetFile).toHaveBeenCalledWith(mockKey)
  })

  it('should return the response from pearpassVaultClient.activeVaultGetFile', async () => {
    pearpassVaultClient.activeVaultGetFile.mockResolvedValue(mockResponse)
    const result = await vaultGetFile(mockKey)
    expect(result).toBe(mockResponse)
  })

  it('should propagate errors from pearpassVaultClient.activeVaultGetFile', async () => {
    const error = new Error('Network error')
    pearpassVaultClient.activeVaultGetFile.mockRejectedValue(error)
    await expect(vaultGetFile(mockKey)).rejects.toThrow('Network error')
  })
})
