import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useVaults } from './useVaults'
import { getVaults } from '../actions/getVaults'
import { initializeVaults } from '../actions/initializeVaults'
import { resetState } from '../actions/resetState'
import { selectVaults } from '../selectors/selectVaults'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/getVaults', () => ({
  getVaults: jest.fn()
}))

jest.mock('../actions/initializeVaults', () => ({
  initializeVaults: jest.fn()
}))

jest.mock('../actions/resetState', () => ({
  resetState: jest.fn()
}))

jest.mock('../selectors/selectVaults', () => ({
  selectVaults: jest.fn()
}))

describe('useVaults', () => {
  const dispatch = jest.fn()
  const mockVaultsState = {
    isLoading: false,
    data: [],
    isInitialized: false,
    isInitializing: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(dispatch)
    useSelector.mockImplementation((selector) => {
      if (selector === selectVaults) {
        return mockVaultsState
      }
      return undefined
    })
    dispatch.mockImplementation((action) => {
      if (typeof action === 'function') {
        return action(dispatch)
      }
      return { payload: ['vault1', 'vault2'] }
    })
  })

  test('should return the correct state and functions', () => {
    const { result } = renderHook(() => useVaults())

    expect(result.current).toEqual({
      isLoading: mockVaultsState.isLoading,
      isInitialized: mockVaultsState.isInitialized,
      data: mockVaultsState.data,
      refetch: expect.any(Function),
      initVaults: expect.any(Function),
      resetState: expect.any(Function)
    })
  })

  test('should not call initVaults if shouldSkip is true', () => {
    renderHook(() => useVaults({ shouldSkip: true }))

    expect(dispatch).not.toHaveBeenCalledWith(initializeVaults())
  })

  test('should not call initVaults if isLoading is true', () => {
    useSelector.mockImplementation(() => ({
      ...mockVaultsState,
      isLoading: true
    }))

    renderHook(() => useVaults())

    expect(dispatch).not.toHaveBeenCalledWith(initializeVaults())
  })

  test('should call onInitialize when initVaults is called', async () => {
    const onInitialize = jest.fn()
    const { result } = renderHook(() => useVaults({ onInitialize }))

    await act(async () => {
      await result.current.initVaults('password')
    })

    expect(dispatch).toHaveBeenCalledWith(initializeVaults('password'))
    expect(onInitialize).toHaveBeenCalledWith(['vault1', 'vault2'])
  })

  test('should call onCompleted when refetch is called', async () => {
    const onCompleted = jest.fn()
    const { result } = renderHook(() => useVaults({ onCompleted }))

    await act(async () => {
      await result.current.refetch()
    })

    expect(dispatch).toHaveBeenCalledWith(getVaults())
    expect(onCompleted).toHaveBeenCalledWith(['vault1', 'vault2'])
  })

  test('should dispatch resetState action when resetState is called', () => {
    const { result } = renderHook(() => useVaults())

    act(() => {
      result.current.resetState()
    })

    expect(dispatch).toHaveBeenCalledWith(resetState())
  })
})
