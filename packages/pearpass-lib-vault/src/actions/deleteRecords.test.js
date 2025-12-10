import { deleteRecords } from './deleteRecords'
import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'
import { vaultRemoveFiles } from '../api/removeFiles'
import { extractFileIdsFromRecord } from '../utils/extractFileIdsFromRecord'

jest.mock('../api/deleteRecords', () => ({
  deleteRecords: jest.fn()
}))
jest.mock('../api/listRecords', () => ({
  listRecords: jest.fn()
}))
jest.mock('../api/removeFiles', () => ({
  vaultRemoveFiles: jest.fn()
}))
jest.mock('../utils/extractFileIdsFromRecord', () => ({
  extractFileIdsFromRecord: jest.fn()
}))

describe('deleteRecords', () => {
  const mockRecordIds = ['record-123', 'record-456']
  const mockRecords = [
    { id: 'record-123', name: 'A' },
    { id: 'record-456', name: 'B' }
  ]

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
    deleteRecordsApi.mockResolvedValue({})
    listRecords.mockResolvedValue(mockRecords)
    vaultRemoveFiles.mockResolvedValue({})
    extractFileIdsFromRecord.mockReturnValue(['file-1', 'file-2'])
  })

  it('should call deleteRecordsApi with correct recordIds', async () => {
    const thunk = deleteRecords(mockRecordIds)
    await thunk(dispatch, getState)

    expect(deleteRecordsApi).toHaveBeenCalledWith(mockRecordIds)
  })

  it('should call removeFiles with correct file keys', async () => {
    const thunk = deleteRecords(mockRecordIds)
    await thunk(dispatch, getState)

    expect(vaultRemoveFiles).toHaveBeenCalledWith([
      { recordId: 'record-123', fileId: 'file-1' },
      { recordId: 'record-123', fileId: 'file-2' },
      { recordId: 'record-456', fileId: 'file-1' },
      { recordId: 'record-456', fileId: 'file-2' }
    ])
  })

  it('should return records as payload', async () => {
    listRecords.mockResolvedValue([])
    const thunk = deleteRecords(mockRecordIds)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual([])
  })

  it('should handle rejection when API call fails', async () => {
    const errorMessage = 'Failed to delete record'
    deleteRecordsApi.mockRejectedValue(new Error(errorMessage))

    const thunk = deleteRecords(mockRecordIds)
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(deleteRecords.rejected.type)
    expect(result.error.message).toContain(errorMessage)
  })

  it('should throw error when recordIds is empty', async () => {
    const thunk = deleteRecords([])
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(deleteRecords.rejected.type)
    expect(result.error.message).toContain('Record ID is required')
  })
})
