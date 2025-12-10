import { vaultRemoveFiles } from './removeFiles'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultRemoveFile: jest.fn()
  }
}))

describe('removeFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws if files is undefined', async () => {
    await expect(vaultRemoveFiles(undefined)).rejects.toThrow(
      'File keys are required'
    )
  })

  it('throws if files is empty array', async () => {
    await expect(vaultRemoveFiles([])).rejects.toThrow('File keys are required')
  })

  it('calls pearpassVaultClient.activeVaultRemoveFile for each file', async () => {
    const files = [
      { recordId: 'rec1', fileId: 'f1' },
      { recordId: 'rec2', fileId: 'f2' }
    ]
    pearpassVaultClient.activeVaultRemoveFile.mockResolvedValueOnce()
    pearpassVaultClient.activeVaultRemoveFile.mockResolvedValueOnce()

    await vaultRemoveFiles(files)

    expect(pearpassVaultClient.activeVaultRemoveFile).toHaveBeenCalledTimes(2)
    expect(pearpassVaultClient.activeVaultRemoveFile).toHaveBeenCalledWith(
      'record/rec1/file/f1'
    )
    expect(pearpassVaultClient.activeVaultRemoveFile).toHaveBeenCalledWith(
      'record/rec2/file/f2'
    )
  })

  it('propagates errors from pearpassVaultClient.activeVaultRemoveFile', async () => {
    const files = [{ recordId: 'rec1', fileId: 'f1' }]
    pearpassVaultClient.activeVaultRemoveFile.mockRejectedValue(
      new Error('fail')
    )

    await expect(vaultRemoveFiles(files)).rejects.toThrow('fail')
  })
})
