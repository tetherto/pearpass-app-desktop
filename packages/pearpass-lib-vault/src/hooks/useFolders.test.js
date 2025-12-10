import { renderHook } from '@testing-library/react'
import { useSelector } from 'react-redux'

import { useFolders } from './useFolders'
import { selectFolders } from '../selectors/selectFolders'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../selectors/selectFolders', () => ({
  selectFolders: jest.fn()
}))

jest.mock('../actions/updateRecords', () => ({
  updateRecords: jest.fn(),
  updateFolder: jest.fn()
}))

jest.mock('../actions/renameFolder', () => ({
  renameFolder: jest.fn(() => Promise.resolve())
}))

describe('useFolders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call selectFolders with correct parameters', () => {
    const mockSelector = jest
      .fn()
      .mockReturnValue({ isLoading: false, data: [] })
    selectFolders.mockReturnValue(mockSelector)
    useSelector.mockImplementation((selector) => selector())

    renderHook(() => useFolders({ variables: { searchPattern: 'test' } }))

    expect(selectFolders).toHaveBeenCalledWith({ searchPattern: 'test' })
  })

  it('should return loading state and data from selector', () => {
    const mockData = [{ id: 1, name: 'Folder 1' }]
    const mockSelector = jest
      .fn()
      .mockReturnValue({ isLoading: false, data: mockData })
    selectFolders.mockReturnValue(mockSelector)
    useSelector.mockImplementation((selector) => selector())

    const { result } = renderHook(() => useFolders())

    expect(result.current).toEqual({
      isLoading: false,
      data: mockData,
      renameFolder: expect.any(Function),
      deleteFolder: expect.any(Function)
    })
  })

  it('should handle undefined variables', () => {
    const mockSelector = jest
      .fn()
      .mockReturnValue({ isLoading: false, data: [] })
    selectFolders.mockReturnValue(mockSelector)
    useSelector.mockImplementation((selector) => selector())

    renderHook(() => useFolders())

    expect(selectFolders).toHaveBeenCalledWith({ searchPattern: undefined })
  })
})
