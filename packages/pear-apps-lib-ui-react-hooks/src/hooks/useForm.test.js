jest.mock('pear-apps-utils-generate-unique-id', () => {
  let idCounter = 1
  return {
    generateUniqueId: () => `unique-id-${idCounter++}`,
    reset: () => {
      idCounter = 1
    }
  }
})

import { renderHook, act } from '@testing-library/react'
import * as uniqueIdModule from 'pear-apps-utils-generate-unique-id'

import { useForm } from './useForm'

describe('useForm hook', () => {
  beforeEach(() => {
    uniqueIdModule.reset()
  })

  test('initializes values correctly with arrays getting unique ids', () => {
    const initialValues = {
      name: 'John',
      hobbies: [{ hobby: 'reading' }, { hobby: 'swimming' }]
    }

    const { result } = renderHook(() => useForm({ initialValues }))

    expect(result.current.values.name).toBe('John')
    expect(result.current.values.hobbies).toHaveLength(2)
    expect(result.current.values.hobbies[0]).toEqual({
      id: 'unique-id-1',
      hobby: 'reading'
    })
    expect(result.current.values.hobbies[1]).toEqual({
      id: 'unique-id-2',
      hobby: 'swimming'
    })
  })

  test('setValue and register onChange update the field value', () => {
    const initialValues = { email: 'old@example.com' }
    const { result } = renderHook(() => useForm({ initialValues }))

    const emailField = result.current.register('email')

    act(() => {
      emailField.onChange({ target: { value: 'new@example.com' } })
    })

    expect(result.current.values.email).toBe('new@example.com')
  })

  test('register onChange clears existing errors for the field', () => {
    const initialValues = { email: 'old@example.com' }
    const validate = () => ({})
    const { result } = renderHook(() => useForm({ initialValues, validate }))

    act(() => {
      result.current.setErrors({ email: 'Invalid email' })
    })
    expect(result.current.errors.email).toBe('Invalid email')

    const emailField = result.current.register('email')
    act(() => {
      emailField.onChange({ target: { value: 'new@example.com' } })
    })

    expect(result.current.errors.email).toBeNull()
  })

  test('handleSubmit calls callback if validation passes', () => {
    const initialValues = { username: 'testuser' }
    const validate = jest.fn(() => ({}))
    const submitCallback = jest.fn()

    const { result } = renderHook(() => useForm({ initialValues, validate }))

    act(() => {
      const handleSubmit = result.current.handleSubmit(submitCallback)
      handleSubmit({ preventDefault: () => {} })
    })

    expect(validate).toHaveBeenCalledWith(result.current.values)
    expect(submitCallback).toHaveBeenCalledWith(result.current.values)
  })

  test('handleSubmit sets errors if validation fails', () => {
    const initialValues = { username: 'testuser' }
    const validationError = { username: 'Required' }
    const validate = () => validationError
    const submitCallback = jest.fn()

    const { result } = renderHook(() => useForm({ initialValues, validate }))

    act(() => {
      const handleSubmit = result.current.handleSubmit(submitCallback)
      handleSubmit({ preventDefault: () => {} })
    })

    expect(result.current.errors).toEqual(validationError)
    expect(submitCallback).not.toHaveBeenCalled()
  })

  test('hasErrors reflects the current error state', () => {
    const initialValues = { name: 'Alice' }
    const { result } = renderHook(() => useForm({ initialValues }))

    expect(result.current.hasErrors).toBe(false)

    act(() => {
      result.current.setErrors({ name: 'Error occurred' })
    })
    expect(result.current.hasErrors).toBe(true)
  })

  test('registerArray addItem and removeItem work correctly', () => {
    const initialValues = { hobbies: [] }
    const { result } = renderHook(() => useForm({ initialValues }))

    act(() => {
      result.current.registerArray('hobbies').addItem({ hobby: 'painting' })
    })
    expect(result.current.values.hobbies).toHaveLength(1)
    expect(result.current.values.hobbies[0]).toMatchObject({
      hobby: 'painting',
      id: 'unique-id-1'
    })

    act(() => {
      result.current.registerArray('hobbies').addItem({ hobby: 'dancing' })
    })
    expect(result.current.values.hobbies).toHaveLength(2)
    expect(result.current.values.hobbies[1]).toMatchObject({
      hobby: 'dancing',
      id: 'unique-id-2'
    })

    act(() => {
      result.current.registerArray('hobbies').removeItem(0)
    })
    expect(result.current.values.hobbies).toHaveLength(1)
    expect(result.current.values.hobbies[0]).toMatchObject({
      hobby: 'dancing',
      id: 'unique-id-2'
    })
  })

  test('registerArray registerItem updates nested value', () => {
    const initialValues = {
      hobbies: [{ hobby: 'reading' }]
    }
    const { result } = renderHook(() => useForm({ initialValues }))

    const hobbyField = result.current
      .registerArray('hobbies')
      .registerItem('hobby', 0)
    expect(hobbyField.value).toBe('reading')
    expect(hobbyField.name).toBe('hobbies[0]')

    act(() => {
      hobbyField.onChange({ target: { value: 'writing' } })
    })

    expect(result.current.values.hobbies[0].hobby).toBe('writing')
  })
})
