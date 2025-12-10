import React from 'react'

import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'

import { useBlindMirrors } from './useBlindMirrors'
import blindMirrorsReducer from '../slices/blindMirrorsSlice'

const createThunkMock = (base) => {
  const fn = jest.fn(() => ({ type: base }))
  fn.pending = { type: `${base}/pending` }
  fn.fulfilled = { type: `${base}/fulfilled` }
  fn.rejected = { type: `${base}/rejected` }
  return fn
}

jest.mock('../actions/addBlindMirrors', () => ({
  addBlindMirrors: createThunkMock('blindMirrors/addBlindMirrors')
}))

jest.mock('../actions/addDefaultBlindMirrors', () => ({
  addDefaultBlindMirrors: createThunkMock('blindMirrors/addDefaultBlindMirrors')
}))

jest.mock('../actions/getBlindMirrors', () => ({
  getBlindMirrors: createThunkMock('blindMirrors/getBlindMirrors')
}))

jest.mock('../actions/removeBlindMirror', () => ({
  removeBlindMirror: createThunkMock('blindMirrors/removeBlindMirror')
}))

jest.mock('../actions/removeAllBlindMirrors', () => ({
  removeAllBlindMirrors: createThunkMock('blindMirrors/removeAllBlindMirrors')
}))

const createMockStore = (initialState = {}) =>
  configureStore({
    reducer: {
      blindMirrors: blindMirrorsReducer
    },
    preloadedState: {
      blindMirrors: {
        isLoading: false,
        error: null,
        data: [],
        ...initialState
      }
    }
  })

const wrapper = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
)

describe('useBlindMirrors', () => {
  let mockStore

  beforeEach(() => {
    mockStore = createMockStore()
    jest.clearAllMocks()
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useBlindMirrors(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore })
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.data).toEqual([])
    expect(typeof result.current.addBlindMirrors).toBe('function')
    expect(typeof result.current.addDefaultBlindMirrors).toBe('function')
    expect(typeof result.current.getBlindMirrors).toBe('function')
    expect(typeof result.current.removeBlindMirror).toBe('function')
    expect(typeof result.current.removeAllBlindMirrors).toBe('function')
  })

  it('should return loading state when isLoading is true', () => {
    mockStore = createMockStore({ isLoading: true })

    const { result } = renderHook(() => useBlindMirrors(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore })
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return error state when error exists', () => {
    const errorMessage = 'Test error'
    mockStore = createMockStore({ error: errorMessage })

    const { result } = renderHook(() => useBlindMirrors(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore })
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('should return data when available', () => {
    const mockData = ['mirror1', 'mirror2', 'mirror3']
    mockStore = createMockStore({ data: mockData })

    const { result } = renderHook(() => useBlindMirrors(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore })
    })

    expect(result.current.data).toEqual(mockData)
  })

  describe('addBlindMirrors', () => {
    it('should throw for invalid input', async () => {
      const { result } = renderHook(() => useBlindMirrors(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore })
      })

      await expect(result.current.addBlindMirrors([])).rejects.toThrow(
        'Invalid blind mirrors array'
      )
      await expect(result.current.addBlindMirrors(null)).rejects.toThrow(
        'Invalid blind mirrors array'
      )
    })

    it('should resolve for valid input', async () => {
      const blindMirrors = ['mirror1', 'mirror2']
      const { result } = renderHook(() => useBlindMirrors(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore })
      })

      await expect(
        result.current.addBlindMirrors(blindMirrors)
      ).resolves.toBeUndefined()
    })
  })

  describe('addDefaultBlindMirrors', () => {
    it('should be callable without arguments', async () => {
      const { result } = renderHook(() => useBlindMirrors(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore })
      })

      await result.current.addDefaultBlindMirrors()
    })
  })

  describe('removeBlindMirror', () => {
    it('should throw when key is missing', async () => {
      const { result } = renderHook(() => useBlindMirrors(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore })
      })

      await expect(result.current.removeBlindMirror('')).rejects.toThrow(
        'Key is required'
      )
      await expect(result.current.removeBlindMirror(null)).rejects.toThrow(
        'Key is required'
      )
    })
  })

  describe('removeAllBlindMirrors', () => {
    it('should be callable without arguments', async () => {
      const { result } = renderHook(() => useBlindMirrors(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore })
      })

      await result.current.removeAllBlindMirrors()
    })
  })

  describe('isLoading guard', () => {
    it('should no-op when isLoading is true', async () => {
      mockStore = createMockStore({ isLoading: true })
      const { result } = renderHook(() => useBlindMirrors(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore })
      })

      await expect(
        result.current.addDefaultBlindMirrors()
      ).resolves.toBeUndefined()
      await expect(result.current.getBlindMirrors()).resolves.toBeUndefined()
      await expect(
        result.current.removeAllBlindMirrors()
      ).resolves.toBeUndefined()
      await expect(
        result.current.addBlindMirrors(['a'])
      ).resolves.toBeUndefined()
      await expect(
        result.current.removeBlindMirror('x')
      ).resolves.toBeUndefined()
    })
  })
})
