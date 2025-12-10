import { processFiles } from './processFiles'
import { validateAndPrepareBuffersFromRecord } from './validateAndPrepareBuffersFromRecord'
import { prepareIdentityFiles } from './validateAndPrepareIdentityData'

jest.mock('./processFiles')
jest.mock('./validateAndPrepareIdentityData')
jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

describe('validateAndPrepareBuffersFromRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process attachments and return correct structure for non-identity record', () => {
    const record = {
      id: 'rec1',
      type: 'password',
      vaultId: 'vault1',
      data: {
        foo: 'bar',
        attachments: [{ id: 'a1', name: 'file1' }]
      },
      folder: 'work',
      isFavorite: true,
      createdAt: 123,
      updatedAt: 456
    }

    processFiles.mockReturnValue({
      buffersWithId: [{ id: 'a1', buffer: Buffer.from('abc') }],
      files: [{ id: 'a1', name: 'file1' }]
    })

    const result = validateAndPrepareBuffersFromRecord(record)

    expect(processFiles).toHaveBeenCalledWith([{ id: 'a1', name: 'file1' }])
    expect(result.buffersWithId).toEqual([
      { id: 'a1', buffer: Buffer.from('abc') }
    ])
    expect(result.recordWithoutBuffers).toEqual({
      id: 'rec1',
      type: 'password',
      vaultId: 'vault1',
      data: {
        foo: 'bar',
        attachments: [{ id: 'a1', name: 'file1' }]
      },
      folder: 'work',
      isFavorite: true,
      createdAt: 123,
      updatedAt: 456
    })
  })

  it('should handle missing attachments gracefully', () => {
    const record = {
      id: 'rec2',
      type: 'password',
      vaultId: 'vault2',
      data: { foo: 'baz' },
      folder: null,
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2
    }

    processFiles.mockReturnValue({
      buffersWithId: [],
      files: []
    })

    const result = validateAndPrepareBuffersFromRecord(record)

    expect(processFiles).toHaveBeenCalledWith([])
    expect(result.buffersWithId).toEqual([])
    expect(result.recordWithoutBuffers.data.attachments).toEqual([])
  })

  it('should process identity records with prepareIdentityFiles', () => {
    const record = {
      id: 'rec3',
      type: 'identity',
      vaultId: 'vault3',
      data: {
        foo: 'bar',
        attachments: [{ id: 'a2', name: 'file2' }]
      },
      folder: 'personal',
      isFavorite: false,
      createdAt: 10,
      updatedAt: 20
    }

    processFiles.mockReturnValue({
      buffersWithId: [{ id: 'a2', buffer: Buffer.from('xyz') }],
      files: [{ id: 'a2', name: 'file2' }]
    })

    prepareIdentityFiles.mockReturnValue({
      identityData: { foo: 'bar', identityField: 'value' },
      buffersWithId: [{ id: 'id1', buffer: Buffer.from('idbuf') }]
    })

    const result = validateAndPrepareBuffersFromRecord(record)

    expect(prepareIdentityFiles).toHaveBeenCalledWith(record.data)
    expect(result.buffersWithId).toEqual([
      { id: 'a2', buffer: Buffer.from('xyz') },
      { id: 'id1', buffer: Buffer.from('idbuf') }
    ])
    expect(result.recordWithoutBuffers).toEqual({
      id: 'rec3',
      type: 'identity',
      vaultId: 'vault3',
      data: {
        foo: 'bar',
        identityField: 'value',
        attachments: [{ id: 'a2', name: 'file2' }]
      },
      folder: 'personal',
      isFavorite: false,
      createdAt: 10,
      updatedAt: 20
    })
  })

  it('should set folder to null if not present', () => {
    const record = {
      id: 'rec4',
      type: 'password',
      vaultId: 'vault4',
      data: {},
      isFavorite: false,
      createdAt: 5,
      updatedAt: 6
    }

    processFiles.mockReturnValue({
      buffersWithId: [],
      files: []
    })

    const result = validateAndPrepareBuffersFromRecord(record)
    expect(result.recordWithoutBuffers.folder).toBeNull()
  })
})
