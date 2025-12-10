import { updateRecordsFactory } from './updateRecordsFactory'
import { validateAndPrepareRecord } from './validateAndPrepareRecord'

jest.mock('./validateAndPrepareRecord', () => ({
  validateAndPrepareRecord: jest.fn()
}))

describe('updateRecordsFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process and validate each record payload', () => {
    const timestamp = 1700000000000
    const mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(timestamp)

    const recordsPayload = [
      {
        id: '1',
        type: 'note',
        vaultId: 'vault-1',
        data: { content: 'Hello' },
        folder: 'folder-a',
        isFavorite: true,
        createdAt: 1600000000000
      },
      {
        id: '2',
        type: 'login',
        vaultId: 'vault-2',
        data: { username: 'user' },
        isFavorite: false,
        createdAt: 1600000005000
      }
    ]

    validateAndPrepareRecord.mockImplementation((record) => record)

    const result = updateRecordsFactory(recordsPayload)

    expect(validateAndPrepareRecord).toHaveBeenCalledTimes(2)

    expect(validateAndPrepareRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        type: 'note',
        vaultId: 'vault-1',
        data: { content: 'Hello' },
        folder: 'folder-a',
        isFavorite: true,
        createdAt: 1600000000000,
        updatedAt: timestamp
      })
    )

    expect(validateAndPrepareRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '2',
        folder: null
      })
    )

    expect(result).toEqual(
      recordsPayload.map((payload) => ({
        ...payload,
        folder: payload.folder || null,
        updatedAt: timestamp
      }))
    )

    mockDateNow.mockRestore()
  })
})
