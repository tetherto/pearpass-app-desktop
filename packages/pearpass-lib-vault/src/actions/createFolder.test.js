import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { createFolder } from './createFolder'
import { createRecord } from '../api/createRecord'

jest.mock('../api/createRecord', () => ({
  createRecord: jest.fn()
}))

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

describe('createFolder', () => {
  const mockVaultId = 'vault-123'
  const mockFolderId = 'folder-456'
  const mockFolderName = 'Test Folder'
  const mockDate = 1633000000000

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()

    global.Date.now = jest.fn().mockReturnValue(mockDate)

    generateUniqueId.mockReturnValue(mockFolderId)

    dispatch = jest.fn()
    getState = jest.fn().mockReturnValue({
      vault: {
        data: {
          id: mockVaultId
        }
      }
    })

    createRecord.mockResolvedValue({})
  })

  it('should create a folder record with correct properties', async () => {
    const thunk = createFolder(mockFolderName)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      id: mockFolderId,
      vaultId: mockVaultId,
      folder: mockFolderName,
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })

  it('should call createRecordApi with correct parameters', async () => {
    const thunk = createFolder(mockFolderName)
    await thunk(dispatch, getState)

    expect(createRecord).toHaveBeenCalledWith({
      id: mockFolderId,
      vaultId: mockVaultId,
      folder: mockFolderName,
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })

  it('should generate a unique ID for the folder', async () => {
    const thunk = createFolder(mockFolderName)
    await thunk(dispatch, getState)

    expect(generateUniqueId).toHaveBeenCalled()
  })
})
