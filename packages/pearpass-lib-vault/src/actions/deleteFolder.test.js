import { deleteFolder } from './deleteFolder'
import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'
import { selectFolders } from '../selectors/selectFolders'

jest.mock('../api/deleteRecords', () => ({
  deleteRecords: jest.fn()
}))
jest.mock('../api/listRecords', () => ({
  listRecords: jest.fn()
}))
jest.mock('../selectors/selectFolders', () => ({
  selectFolders: jest.fn()
}))

describe('deleteFolder', () => {
  const mockFolderName = 'oldName'

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
  })

  it('should call deleteRecordsApi with correct recordIds', async () => {
    deleteRecordsApi.mockResolvedValue({})
    listRecords.mockReturnValue([])

    const name = 'oldName'
    const oldRecords = [
      { id: 'rec-1', folder: name },
      { id: 'rec-2', folder: name }
    ]

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

    const thunk = deleteFolder(mockFolderName)
    const result = await thunk(dispatch, getState)

    expect(deleteRecordsApi).toHaveBeenCalledWith(['rec-1', 'rec-2'])
    expect(listRecords).toHaveBeenCalled()
    expect(result.payload).toEqual([])
  })

  it('should return undefined payload if no folder is passed', async () => {
    const thunk = deleteFolder(undefined)
    const result = await thunk(dispatch, getState)

    expect(deleteRecordsApi).not.toHaveBeenCalled()
    expect(listRecords).not.toHaveBeenCalled()
    expect(result.payload).toBeUndefined()
  })

  it('should handle API failure and reject the thunk', async () => {
    const errorMessage = 'API failed'
    deleteRecordsApi.mockRejectedValue(new Error(errorMessage))

    const name = 'oldName'
    const oldRecords = [
      { id: 'rec-1', folder: name },
      { id: 'rec-2', folder: name }
    ]

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

    const thunk = deleteFolder(name)
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(deleteFolder.rejected.type)
    expect(result.error.message).toContain(errorMessage)
  })
})
