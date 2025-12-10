import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { createRecordFactory } from './createRecordFactory'
import { validateAndPrepareRecord } from './validateAndPrepareRecord'

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

jest.mock('./validateAndPrepareRecord', () => ({
  validateAndPrepareRecord: jest.fn()
}))

describe('createRecordFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a record with correct fields and call dependencies', () => {
    const mockId = '123-abc'
    const payload = {
      type: 'note',
      data: { content: 'Hello' },
      folder: 'folder1',
      isFavorite: true
    }
    const vaultId = 'vault-456'

    generateUniqueId.mockReturnValue(mockId)
    validateAndPrepareRecord.mockImplementation((record) => record)

    const result = createRecordFactory(payload, vaultId)

    expect(generateUniqueId).toHaveBeenCalled()
    expect(validateAndPrepareRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockId,
        type: 'note',
        vaultId,
        data: { content: 'Hello' },
        folder: 'folder1',
        isFavorite: true
      })
    )

    expect(result.id).toBe(mockId)
    expect(result.vaultId).toBe(vaultId)
    expect(result.createdAt).toBeGreaterThan(0)
    expect(result.updatedAt).toBeGreaterThanOrEqual(result.createdAt)
  })

  it('should default folder to null and isFavorite to false', () => {
    const mockId = '789-def'
    const payload = {
      type: 'login',
      data: { username: 'test' }
    }
    const vaultId = 'vault-999'

    generateUniqueId.mockReturnValue(mockId)
    validateAndPrepareRecord.mockImplementation((record) => record)

    const result = createRecordFactory(payload, vaultId)

    expect(result.folder).toBeNull()
    expect(result.isFavorite).toBe(false)
  })
})
