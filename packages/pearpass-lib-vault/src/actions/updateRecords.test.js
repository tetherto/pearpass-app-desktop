import {
  updateRecords,
  updateFolder,
  updateFavoriteState
} from './updateRecords'
import { listRecords } from '../api/listRecords'
import { updateRecords as updateRecordApi } from '../api/updateRecords'
import { validateAndPrepareRecord } from '../utils/validateAndPrepareRecord'

jest.mock('../api/updateRecords', () => ({
  updateRecords: jest.fn()
}))
jest.mock('../api/listRecords', () => ({
  listRecords: jest.fn()
}))

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn(() => 'unique-id')
}))

jest.mock('../utils/validateAndPrepareRecord', () => ({
  validateAndPrepareRecord: jest.fn((record) => record)
}))

describe('updateRecord actions', () => {
  const mockDate = 1633000000000
  let dispatch, getState

  beforeEach(() => {
    jest.clearAllMocks()
    global.Date.now = jest.fn().mockReturnValue(mockDate)

    dispatch = jest.fn().mockImplementation((fn) => {
      if (typeof fn === 'function') {
        return fn(dispatch, getState)
      }
      return fn
    })

    getState = jest.fn().mockReturnValue({
      vault: {
        data: {
          records: [
            {
              id: 'record-1',
              type: 'password',
              vaultId: 'vault-1',
              data: {},
              folder: 'folder-1',
              isFavorite: false,
              createdAt: 1632000000000
            },
            {
              id: 'record-2',
              type: 'note',
              vaultId: 'vault-1',
              data: {},
              folder: null,
              isFavorite: true,
              createdAt: 1632000000000
            }
          ]
        }
      }
    })

    updateRecordApi.mockResolvedValue({})
  })

  it('should update a record with the correct properties', async () => {
    const payload = [
      {
        id: 'record-1',
        type: 'password',
        vaultId: 'vault-1',
        data: { username: 'test', password: 'test123' },
        folder: 'folder-1',
        isFavorite: false,
        createdAt: 1632000000000
      }
    ]

    listRecords.mockResolvedValue([
      {
        ...payload[0],
        updatedAt: mockDate
      }
    ])
    const thunk = updateRecords(payload)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual([
      {
        ...payload[0],
        updatedAt: mockDate
      }
    ])
  })

  it('should call updateRecordApi with the validated record', async () => {
    const payload = [
      {
        id: 'record-1',
        type: 'password',
        vaultId: 'vault-1',
        data: { username: 'test', password: 'test123' },
        folder: 'folder-1',
        isFavorite: false,
        createdAt: 1632000000000
      }
    ]

    const thunk = updateRecords(payload)
    await thunk(dispatch, getState)

    expect(validateAndPrepareRecord).toHaveBeenCalledWith({
      ...payload[0],
      data: {
        ...payload[0].data,
        attachments: []
      },
      updatedAt: mockDate
    })
    expect(updateRecordApi).toHaveBeenCalledWith([
      {
        ...payload[0],
        data: {
          ...payload[0].data,
          attachments: []
        },
        updatedAt: mockDate
      }
    ])
  })

  it('should set folder to null if not provided', async () => {
    const payload = [
      {
        id: 'record-1',
        type: 'password',
        vaultId: 'vault-1',
        data: {},
        isFavorite: false,
        createdAt: 1632000000000
      }
    ]

    listRecords.mockResolvedValue([
      {
        ...payload[0],
        folder: null,
        updatedAt: mockDate
      }
    ])
    const thunk = updateRecords(payload)
    const result = await thunk(dispatch, getState)

    expect(result.payload[0].folder).toBeNull()
  })

  it('should dispatch updateRecord with updated folder', async () => {
    await updateFolder(['record-1'], 'new-folder')(dispatch, getState)

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function))
    expect(updateRecordApi).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'record-1',
        folder: 'new-folder',
        updatedAt: mockDate
      })
    ])
  })

  it('should dispatch updateRecord with updated isFavorite', async () => {
    await updateFavoriteState(['record-1'], true)(dispatch, getState)

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function))
    expect(updateRecordApi).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'record-1',
        isFavorite: true,
        updatedAt: mockDate
      })
    ])
  })

  it('should not dispatch if record is not found', () => {
    const result = updateFavoriteState(['non-existent'], true)(
      dispatch,
      getState
    )

    expect(result[0]).toBeUndefined()
    expect(updateRecordApi).not.toHaveBeenCalled()
  })
})
