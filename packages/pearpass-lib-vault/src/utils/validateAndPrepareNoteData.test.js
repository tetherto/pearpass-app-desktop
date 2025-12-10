import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'
import { validateAndPrepareNoteData } from './validateAndPrepareNoteData'

jest.mock('./validateAndPrepareCustomFields', () => ({
  validateAndPrepareCustomFields: jest.fn((fields) => fields || [])
}))

describe('validateAndPrepareNoteData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate and prepare valid note data', () => {
    const noteData = {
      title: 'Test Note',
      note: 'This is a test note',
      customFields: [{ key: 'field1', value: 'value1' }]
    }

    const result = validateAndPrepareNoteData(noteData)

    expect(result).toEqual({
      title: 'Test Note',
      note: 'This is a test note',
      customFields: [{ key: 'field1', value: 'value1' }]
    })
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(
      noteData.customFields
    )
  })

  it('should validate and prepare note data without optional fields', () => {
    const noteData = {
      title: 'Test Note'
    }

    const result = validateAndPrepareNoteData(noteData)

    expect(result).toEqual({
      title: 'Test Note',
      note: undefined,
      customFields: []
    })
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(undefined)
  })

  it('should throw error when title is missing', () => {
    const noteData = {
      note: 'This is a test note'
    }

    expect(() => validateAndPrepareNoteData(noteData)).toThrow(
      /Invalid note data/
    )
  })

  it('should throw error when title is not a string', () => {
    const noteData = {
      title: 123,
      note: 'This is a test note'
    }

    expect(() => validateAndPrepareNoteData(noteData)).toThrow(
      /Invalid note data/
    )
  })

  it('should call validateAndPrepareCustomFields with customFields', () => {
    const customFields = [{ key: 'testKey', value: 'testValue' }]
    const noteData = {
      title: 'Test Note',
      customFields
    }

    validateAndPrepareNoteData(noteData)

    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(customFields)
  })
})
