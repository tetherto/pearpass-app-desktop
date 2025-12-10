import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useCreateRecord } from './useCreateRecord'
import { createRecord as createRecordAction } from '../actions/createRecord'
import { selectVault } from '../selectors/selectVault'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/createRecord', () => ({
  createRecord: jest.fn()
}))

jest.mock('../selectors/selectVault', () => ({
  selectVault: jest.fn()
}))

describe('useCreateRecord', () => {
  let mockDispatch

  beforeEach(() => {
    jest.clearAllMocks()
    mockDispatch = jest.fn()
    useDispatch.mockReturnValue(mockDispatch)
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isRecordLoading: false }
      }
      return {}
    })
  })

  it('should return isLoading state from selector', () => {
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isRecordLoading: true }
      }
      return {}
    })

    const { result } = renderHook(() => useCreateRecord())
    expect(result.current.isLoading).toBe(true)
  })

  it('should call createRecord action with record data', async () => {
    const record = { title: 'Test Record', content: 'Test Content' }
    mockDispatch.mockResolvedValue({ error: false, payload: { record } })
    createRecordAction.mockReturnValue('ACTION')

    const { result } = renderHook(() => useCreateRecord())

    await act(async () => {
      await result.current.createRecord(record)
    })

    expect(createRecordAction).toHaveBeenCalledWith(record)
    expect(mockDispatch).toHaveBeenCalledWith('ACTION')
  })

  it('should call onCompleted callback when record is created successfully', async () => {
    const record = { title: 'Test Record', content: 'Test Content' }
    const payload = { record }
    const onCompleted = jest.fn()
    mockDispatch.mockResolvedValue({ error: false, payload })

    const { result } = renderHook(() => useCreateRecord({ onCompleted }))

    await act(async () => {
      await result.current.createRecord(record)
    })

    expect(onCompleted).toHaveBeenCalledWith(payload)
  })

  it('should not call onCompleted callback when there is an error', async () => {
    const record = { title: 'Test Record', content: 'Test Content' }
    const onCompleted = jest.fn()
    mockDispatch.mockResolvedValue({ error: true })

    const { result } = renderHook(() => useCreateRecord({ onCompleted }))

    await act(async () => {
      await expect(result.current.createRecord(record)).rejects.toThrow(
        'Failed to create record'
      )
    })

    expect(onCompleted).not.toHaveBeenCalled()
  })
})
