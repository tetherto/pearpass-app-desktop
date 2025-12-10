import { renameFolder } from './renameFolder'
import { createRecord as createRecordApi } from '../api/createRecord'
import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'
import { updateRecords as updateRecordsApi } from '../api/updateRecords'
import { selectFolders } from '../selectors/selectFolders'
import { createFolderFactory } from '../utils/createFolderFactory'
import { updateFolderFactory } from '../utils/updateFolderFactory'

jest.mock('../api/createRecord', () => ({
  createRecord: jest.fn()
}))
jest.mock('../api/deleteRecords', () => ({
  deleteRecords: jest.fn()
}))
jest.mock('../api/updateRecords', () => ({
  updateRecords: jest.fn()
}))
jest.mock('../api/listRecords', () => ({
  listRecords: jest.fn()
}))
jest.mock('../utils/createFolderFactory', () => ({
  createFolderFactory: jest.fn()
}))
jest.mock('../utils/updateFolderFactory', () => ({
  updateFolderFactory: jest.fn()
}))
jest.mock('../selectors/selectFolders', () => ({
  selectFolders: jest.fn()
}))

describe('renameFolder thunk', () => {
  const vaultId = 'vault-1'
  const mockNewRecord = { id: 'folder-record', type: 'folder', name: 'Renamed' }

  const mockState = {
    vault: {
      data: {
        id: vaultId,
        records: []
      }
    }
  }

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn(() => mockState)
  })

  it('should return early if no selectedFolder is passed', async () => {
    const thunk = renameFolder({ selectedFolder: null, newName: 'NewName' })
    const result = await thunk(dispatch, getState)

    expect(result.payload).toBeUndefined()
    expect(createRecordApi).not.toHaveBeenCalled()
  })

  it('should return early if folder name has not changed', async () => {
    const selectedFolder = { name: 'SameName', records: [] }
    const thunk = renameFolder({ selectedFolder, newName: 'SameName' })
    const result = await thunk(dispatch, getState)

    expect(result.payload).toBeUndefined()
    expect(createRecordApi).not.toHaveBeenCalled()
  })

  it('should create a new folder record, update and delete records, then return updated list', async () => {
    const name = 'oldName'
    const newName = 'Renamed'
    const oldRecords = [
      { id: 'rec-1', folder: name, data: {} },
      { id: 'rec-2', folder: name }
    ]
    const updatedRecords = [{ id: 'rec-1', folder: newName }]
    const refreshedRecords = [{ id: 'rec-1', folder: newName }]

    selectFolders.mockReturnValue(() => ({
      data: {
        customFolders: {
          [name]: {
            name: name,
            records: oldRecords
          }
        }
      }
    }))

    createFolderFactory.mockReturnValue(mockNewRecord)
    createRecordApi.mockResolvedValue({})
    updateFolderFactory.mockReturnValue(updatedRecords)
    updateRecordsApi.mockResolvedValue({})
    deleteRecordsApi.mockResolvedValue({})
    listRecords.mockReturnValue(refreshedRecords)

    const thunk = renameFolder({ name, newName })
    const result = await thunk(dispatch, getState)

    expect(createFolderFactory).toHaveBeenCalledWith(newName, vaultId)
    expect(createRecordApi).toHaveBeenCalledWith(mockNewRecord)
    expect(updateFolderFactory).toHaveBeenCalledWith(
      ['rec-1'],
      newName,
      mockState.vault
    )
    expect(updateRecordsApi).toHaveBeenCalledWith(updatedRecords)
    expect(deleteRecordsApi).toHaveBeenCalledWith(['rec-2'])
    expect(listRecords).toHaveBeenCalled()
    expect(result.payload).toEqual(refreshedRecords)
  })

  it('should handle failure and reject the thunk', async () => {
    const name = 'oldName'
    const newName = 'Renamed'
    const errorMessage = 'Something went wrong'
    createFolderFactory.mockReturnValue(mockNewRecord)
    createRecordApi.mockRejectedValue(new Error(errorMessage))

    const thunk = renameFolder({ name, newName })
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(renameFolder.rejected.type)
    expect(result.error.message).toContain(errorMessage)
  })
})
