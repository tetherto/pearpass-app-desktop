import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'

describe('validateAndPrepareCustomFields', () => {
  test('returns empty array when customFields is null', () => {
    const result = validateAndPrepareCustomFields(null)
    expect(result).toEqual([])
  })

  test('returns empty array when customFields is undefined', () => {
    const result = validateAndPrepareCustomFields(undefined)
    expect(result).toEqual([])
  })

  test('processes note type custom fields correctly', () => {
    const customFields = [{ type: 'note', note: 'Test note' }]
    const result = validateAndPrepareCustomFields(customFields)
    expect(result).toEqual([{ type: 'note', note: 'Test note' }])
  })

  test('processes multiple note type custom fields correctly', () => {
    const customFields = [
      { type: 'note', note: 'Test note 1' },
      { type: 'note', note: 'Test note 2' }
    ]
    const result = validateAndPrepareCustomFields(customFields)
    expect(result).toEqual([
      { type: 'note', note: 'Test note 1' },
      { type: 'note', note: 'Test note 2' }
    ])
  })

  test('throws error for invalid custom field type', () => {
    const customFields = [{ type: 'invalid', note: 'Test note' }]
    expect(() => {
      validateAndPrepareCustomFields(customFields)
    }).toThrow('Invalid custom field type: invalid')
  })

  test('throws error if one of multiple fields has invalid type', () => {
    const customFields = [
      { type: 'note', note: 'Valid note' },
      { type: 'invalid', note: 'Invalid type' }
    ]
    expect(() => {
      validateAndPrepareCustomFields(customFields)
    }).toThrow('Invalid custom field type: invalid')
  })
})
