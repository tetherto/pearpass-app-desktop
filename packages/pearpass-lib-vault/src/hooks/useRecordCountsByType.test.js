import { renderHook } from '@testing-library/react'
import { useSelector } from 'react-redux'

import { useRecordCountsByType } from './useRecordCountsByType'
import { selectRecordCountsByType } from '../selectors/selectRecordCountsByType'

jest.mock('react-redux', () => ({
  useSelector: jest.fn()
}))

jest.mock('../selectors/selectRecordCountsByType', () => ({
  selectRecordCountsByType: jest.fn()
}))

describe('useRecordCountsByType', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call selectRecordCountsByType with correct filters', () => {
    const filters = { folder: 'test-folder', isFavorite: true }
    const mockSelector = jest.fn()
    selectRecordCountsByType.mockReturnValue(mockSelector)
    useSelector.mockReturnValue({ isLoading: false, data: {} })

    renderHook(() => useRecordCountsByType({ variables: { filters } }))

    expect(selectRecordCountsByType).toHaveBeenCalledWith({ filters })
    expect(useSelector).toHaveBeenCalledWith(mockSelector)
  })

  it('should return loading state and data from selector', () => {
    const expectedResult = { isLoading: true, data: { login: 5, note: 3 } }
    selectRecordCountsByType.mockReturnValue(() => {})
    useSelector.mockReturnValue(expectedResult)

    const { result } = renderHook(() => useRecordCountsByType())

    expect(result.current).toEqual(expectedResult)
  })

  it('should handle undefined variables', () => {
    selectRecordCountsByType.mockReturnValue(() => {})
    useSelector.mockReturnValue({ isLoading: false, data: {} })

    renderHook(() => useRecordCountsByType())

    expect(selectRecordCountsByType).toHaveBeenCalledWith({
      filters: undefined
    })
  })
})
