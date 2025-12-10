import { renderHook } from '@testing-library/react'
import { useSelector } from 'react-redux'

import { useRecordById } from './useRecordById'
import { selectRecordById } from '../selectors/selectRecordById'

jest.mock('react-redux', () => ({
  useSelector: jest.fn()
}))

jest.mock('../selectors/selectRecordById', () => ({
  selectRecordById: jest.fn()
}))

describe('useRecordById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading state and data from selector', () => {
    const mockSelector = jest.fn()
    const mockId = 'test-id'
    const mockResult = {
      isLoading: false,
      data: { id: mockId, name: 'Test Record' }
    }

    selectRecordById.mockReturnValue(mockSelector)
    useSelector.mockReturnValue(mockResult)

    const { result } = renderHook(() =>
      useRecordById({ variables: { id: mockId } })
    )

    expect(selectRecordById).toHaveBeenCalledWith(mockId)
    expect(useSelector).toHaveBeenCalledWith(mockSelector)
    expect(result.current).toEqual(mockResult)
  })

  it('should handle undefined variables', () => {
    const mockSelector = jest.fn()
    const mockResult = { isLoading: true, data: null }

    selectRecordById.mockReturnValue(mockSelector)
    useSelector.mockReturnValue(mockResult)

    const { result } = renderHook(() => useRecordById())

    expect(selectRecordById).toHaveBeenCalledWith(undefined)
    expect(useSelector).toHaveBeenCalledWith(mockSelector)
    expect(result.current).toEqual(mockResult)
  })

  it('should handle undefined id in variables', () => {
    const mockSelector = jest.fn()
    const mockResult = { isLoading: true, data: null }

    selectRecordById.mockReturnValue(mockSelector)
    useSelector.mockReturnValue(mockResult)

    const { result } = renderHook(() => useRecordById({ variables: {} }))

    expect(selectRecordById).toHaveBeenCalledWith(undefined)
    expect(useSelector).toHaveBeenCalledWith(mockSelector)
    expect(result.current).toEqual(mockResult)
  })
})
