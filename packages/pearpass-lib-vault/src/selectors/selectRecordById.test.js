import { selectRecordById } from './selectRecordById'

describe('selectRecordById', () => {
  it('should return isLoading state correctly', () => {
    const mockState = {
      vault: {
        isRecordLoading: true,
        data: null
      }
    }

    const selector = selectRecordById('123')
    const result = selector(mockState)

    expect(result.isLoading).toBe(true)
  })

  it('should return the record with matching id', () => {
    const mockRecord = { id: '123', name: 'Test Record' }
    const mockState = {
      vault: {
        isRecordLoading: false,
        data: {
          records: [
            { id: '111', name: 'Other Record' },
            mockRecord,
            { id: '222', name: 'Another Record' }
          ]
        }
      }
    }

    const selector = selectRecordById('123')
    const result = selector(mockState)

    expect(result.isLoading).toBe(false)
    expect(result.data).toEqual(mockRecord)
  })

  it('should return undefined when record does not exist', () => {
    const mockState = {
      vault: {
        isRecordLoading: false,
        data: {
          records: [
            { id: '111', name: 'Other Record' },
            { id: '222', name: 'Another Record' }
          ]
        }
      }
    }

    const selector = selectRecordById('123')
    const result = selector(mockState)

    expect(result.isLoading).toBe(false)
    expect(result.data).toBeUndefined()
  })

  it('should handle null data properly', () => {
    const mockState = {
      vault: {
        isRecordLoading: false,
        data: null
      }
    }

    const selector = selectRecordById('123')
    const result = selector(mockState)

    expect(result.isLoading).toBe(false)
    expect(result.data).toBeUndefined()
  })
})
