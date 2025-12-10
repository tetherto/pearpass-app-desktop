import { extractDeletedIdsFromRecord } from './extractDeletedIdsFromRecord'

describe('extractDeletedIdsFromRecord', () => {
  it('should throw an error if currentRecord is not provided', () => {
    expect(() => {
      extractDeletedIdsFromRecord({ newRecord: { id: '123' } })
    }).toThrow('Current record is required')
  })

  it('should throw an error if record IDs do not match', () => {
    expect(() => {
      extractDeletedIdsFromRecord({
        newRecord: { id: '123' },
        currentRecord: { id: '456' }
      })
    }).toThrow('New record ID does not match current record ID')
  })

  it('should extract deleted attachment IDs', () => {
    const result = extractDeletedIdsFromRecord({
      newRecord: {
        id: '123',
        data: {
          attachments: [{ id: '1' }, { id: '2' }]
        }
      },
      currentRecord: {
        id: '123',
        data: {
          attachments: [{ id: '1' }, { id: '2' }, { id: '3' }]
        }
      }
    })

    expect(result).toEqual(['3'])
  })

  it('should handle identity record type with document pictures', () => {
    const result = extractDeletedIdsFromRecord({
      newRecord: {
        id: '123',
        type: 'identity',
        data: {
          attachments: [{ id: 'a1' }],
          passportPicture: [{ id: 'p1' }],
          idCardPicture: [{ id: 'i1' }],
          drivingLicensePicture: [{ id: 'd1' }]
        }
      },
      currentRecord: {
        id: '123',
        type: 'identity',
        data: {
          attachments: [{ id: 'a1' }, { id: 'a2' }],
          passportPicture: [{ id: 'p1' }, { id: 'p2' }],
          idCardPicture: [{ id: 'i1' }, { id: 'i2' }],
          drivingLicensePicture: [{ id: 'd1' }, { id: 'd2' }]
        }
      }
    })

    expect(result).toContain('a2')
    expect(result).toContain('p2')
    expect(result).toContain('i2')
    expect(result).toContain('d2')
    expect(result.length).toBe(4)
  })

  it('should handle undefined data fields', () => {
    const result = extractDeletedIdsFromRecord({
      newRecord: {
        id: '123',
        data: {}
      },
      currentRecord: {
        id: '123',
        data: {
          attachments: [{ id: '1' }, { id: '2' }]
        }
      }
    })

    expect(result).toEqual(['1', '2'])
  })

  it('should return empty array when no files are deleted', () => {
    const result = extractDeletedIdsFromRecord({
      newRecord: {
        id: '123',
        data: {
          attachments: [{ id: '1' }, { id: '2' }]
        }
      },
      currentRecord: {
        id: '123',
        data: {
          attachments: [{ id: '1' }, { id: '2' }]
        }
      }
    })

    expect(result).toEqual([])
  })
})
