import { renderHook, act } from '@testing-library/react'
import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { useCustomFields } from './useCustomFields'

jest.mock('pear-apps-utils-generate-unique-id', () => ({
  generateUniqueId: jest.fn()
}))

describe('useCustomFields', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    generateUniqueId.mockReturnValue('test-id-123')
  })

  test('should initialize with empty customFields by default', () => {
    const { result } = renderHook(() => useCustomFields())

    expect(result.current.customFields).toEqual([])
  })

  test('should initialize with provided customFields', () => {
    const initialCustomFields = [
      { id: 'field1', type: 'text', props: { label: 'Field 1' } }
    ]

    const { result } = renderHook(() =>
      useCustomFields({ customFields: initialCustomFields })
    )

    expect(result.current.customFields).toEqual(initialCustomFields)
  })

  test('should create a custom field with the correct structure', () => {
    const { result } = renderHook(() => useCustomFields())

    const newField = result.current.createCustomField('text', {
      label: 'New Field'
    })

    expect(generateUniqueId).toHaveBeenCalledTimes(1)
    expect(newField).toEqual({
      id: 'test-id-123',
      type: 'text',
      props: { label: 'New Field' }
    })
  })

  test('should update customFields with setCustomFields', () => {
    const { result } = renderHook(() => useCustomFields())

    const newCustomFields = [
      { id: 'field1', type: 'text', props: { label: 'Field 1' } }
    ]

    act(() => {
      result.current.setCustomFields(newCustomFields)
    })

    expect(result.current.customFields).toEqual(newCustomFields)
  })

  test('should handle multiple custom fields', () => {
    generateUniqueId.mockReturnValueOnce('id-1').mockReturnValueOnce('id-2')

    const { result } = renderHook(() => useCustomFields())

    const field1 = result.current.createCustomField('text', {
      label: 'Field 1'
    })
    const field2 = result.current.createCustomField('checkbox', {
      label: 'Field 2',
      checked: false
    })

    act(() => {
      result.current.setCustomFields([field1, field2])
    })

    expect(result.current.customFields).toEqual([
      { id: 'id-1', type: 'text', props: { label: 'Field 1' } },
      {
        id: 'id-2',
        type: 'checkbox',
        props: { label: 'Field 2', checked: false }
      }
    ])
  })
})
