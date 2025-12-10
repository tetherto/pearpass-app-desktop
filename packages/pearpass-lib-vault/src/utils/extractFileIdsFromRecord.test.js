import { extractFileIdsFromRecord } from './extractFileIdsFromRecord'
import { extractIds } from './extractIds'

jest.mock('./extractIds', () => ({
  extractIds: jest.fn()
}))

describe('extractFileIdsFromRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should extract file IDs from attachments for non-identity records', () => {
    const record = {
      type: 'note',
      data: {
        attachments: ['file1', 'file2']
      }
    }
    extractIds.mockReturnValue(['id1', 'id2'])

    const result = extractFileIdsFromRecord(record)

    expect(extractIds).toHaveBeenCalledWith(['file1', 'file2'])
    expect(result).toEqual(['id1', 'id2'])
  })

  it('should extract file IDs from all sources for identity records', () => {
    const record = {
      type: 'identity',
      data: {
        attachments: ['file1'],
        passportPicture: ['passport1'],
        idCardPicture: ['idCard1'],
        drivingLicensePicture: ['license1']
      }
    }

    extractIds.mockReturnValueOnce(['att1'])
    extractIds.mockReturnValueOnce(['pass1'])
    extractIds.mockReturnValueOnce(['id1'])
    extractIds.mockReturnValueOnce(['lic1'])

    const result = extractFileIdsFromRecord(record)

    expect(extractIds).toHaveBeenCalledTimes(4)
    expect(extractIds).toHaveBeenNthCalledWith(1, ['file1'])
    expect(extractIds).toHaveBeenNthCalledWith(2, ['passport1'])
    expect(extractIds).toHaveBeenNthCalledWith(3, ['idCard1'])
    expect(extractIds).toHaveBeenNthCalledWith(4, ['license1'])
    expect(result).toEqual(['att1', 'pass1', 'id1', 'lic1'])
  })

  it('should handle undefined data properties', () => {
    const record = {
      type: 'identity',
      data: {}
    }

    extractIds.mockReturnValue([])

    const result = extractFileIdsFromRecord(record)

    expect(extractIds).toHaveBeenCalledTimes(4)
    expect(extractIds).toHaveBeenNthCalledWith(1, undefined)
    expect(extractIds).toHaveBeenNthCalledWith(2, undefined)
    expect(extractIds).toHaveBeenNthCalledWith(3, undefined)
    expect(extractIds).toHaveBeenNthCalledWith(4, undefined)
    expect(result).toEqual([])
  })

  it('should handle completely empty record', () => {
    const record = {}
    extractIds.mockReturnValue([])

    const result = extractFileIdsFromRecord(record)

    expect(extractIds).toHaveBeenCalledWith(undefined)
    expect(result).toEqual([])
  })
})
