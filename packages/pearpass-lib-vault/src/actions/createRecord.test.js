import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { createRecord } from './createRecord'
import { createRecord as createRecordApi } from '../api/createRecord'
import { validateAndPrepareRecord } from '../utils/validateAndPrepareRecord'

jest.mock('../api/createRecord', () => ({
  createRecord: jest.fn()
}))

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

jest.mock('../utils/validateAndPrepareRecord', () => ({
  validateAndPrepareRecord: jest.fn((record) => record)
}))

describe('createRecord', () => {
  const mockVaultId = 'vault-123'
  const mockRecordId = 'record-456'
  const mockDate = 1633000000000
  const mockPayload = {
    type: 'password',
    data: {
      username: 'testuser',
      password: 'testpass',
      attachments: [],
      passwordUpdatedAt: mockDate
    },
    folder: 'folder-123',
    isFavorite: true
  }

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()

    global.Date.now = jest.fn().mockReturnValue(mockDate)

    generateUniqueId.mockReturnValue(mockRecordId)

    dispatch = jest.fn()
    getState = jest.fn().mockReturnValue({
      vault: {
        data: {
          id: mockVaultId
        }
      }
    })

    createRecordApi.mockResolvedValue({})
    validateAndPrepareRecord.mockImplementation((record) => record)
  })

  it('should create a record with correct properties', async () => {
    const thunk = createRecord(mockPayload)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      id: mockRecordId,
      type: mockPayload.type,
      vaultId: mockVaultId,
      data: mockPayload.data,
      folder: mockPayload.folder,
      isFavorite: mockPayload.isFavorite,
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })

  it('should call createRecordApi with correct parameters', async () => {
    const thunk = createRecord(mockPayload)
    await thunk(dispatch, getState)

    expect(createRecordApi).toHaveBeenCalledWith({
      id: mockRecordId,
      type: mockPayload.type,
      vaultId: mockVaultId,
      data: mockPayload.data,
      folder: mockPayload.folder,
      isFavorite: mockPayload.isFavorite,
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })

  it('should set folder to null if not provided', async () => {
    const payloadWithoutFolder = { ...mockPayload, folder: undefined }
    const thunk = createRecord(payloadWithoutFolder)
    const result = await thunk(dispatch, getState)

    expect(result.payload.folder).toBeNull()
  })

  it('should convert isFavorite to boolean', async () => {
    let payloadWithFalsyFavorite = { ...mockPayload, isFavorite: 0 }
    let thunk = createRecord(payloadWithFalsyFavorite)
    let result = await thunk(dispatch, getState)

    expect(result.payload.isFavorite).toBe(false)

    payloadWithFalsyFavorite = { ...mockPayload, isFavorite: 'yes' }
    thunk = createRecord(payloadWithFalsyFavorite)
    result = await thunk(dispatch, getState)
    expect(result.payload.isFavorite).toBe(true)
  })

  it('should throw an error if validation fails', async () => {
    validateAndPrepareRecord.mockImplementation(() => {
      throw new Error('Validation error')
    })

    const thunk = createRecord(mockPayload)

    const result = await thunk(dispatch, getState)

    await expect(result.type).toBe(createRecord.rejected.type)

    expect(createRecordApi).not.toHaveBeenCalled()
  })

  it('should generate a unique ID for the record', async () => {
    const thunk = createRecord(mockPayload)
    await thunk(dispatch, getState)

    expect(generateUniqueId).toHaveBeenCalled()
  })
})
