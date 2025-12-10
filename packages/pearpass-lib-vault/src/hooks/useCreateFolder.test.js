import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useCreateFolder } from './useCreateFolder'
import { createFolder as createFolderAction } from '../actions/createFolder'
import '@testing-library/jest-dom'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/createFolder', () => ({
  createFolder: jest.fn()
}))

describe('useCreateFolder', () => {
  const mockDispatch = jest.fn()
  const onCompletedMock = jest.fn()
  const onErrorMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    useSelector.mockImplementation((selector) => {
      if (selector === expect.any(Function)) {
        return { data: { customFolders: {} } }
      }
      return { isFolderLoading: false }
    })
    mockDispatch.mockResolvedValue({
      error: null,
      payload: { name: 'test-folder' }
    })
  })

  test('should return isLoading state and createFolder function', () => {
    const { result } = renderHook(() => useCreateFolder())

    expect(result.current.isLoading).toBe(false)
    expect(typeof result.current.createFolder).toBe('function')
  })

  test('should create folder successfully', async () => {
    createFolderAction.mockReturnValue('create-action')
    mockDispatch.mockResolvedValue({
      error: null,
      payload: { name: 'test-folder' }
    })

    const { result } = renderHook(() =>
      useCreateFolder({
        onCompleted: onCompletedMock,
        onError: onErrorMock
      })
    )

    await act(async () => {
      await result.current.createFolder('test-folder')
    })

    expect(createFolderAction).toHaveBeenCalledWith('test-folder')
    expect(mockDispatch).toHaveBeenCalledWith('create-action')
    expect(onCompletedMock).toHaveBeenCalledWith({ name: 'test-folder' })
    expect(onErrorMock).not.toHaveBeenCalled()
  })

  test('should handle empty folder name', async () => {
    const { result } = renderHook(() =>
      useCreateFolder({
        onCompleted: onCompletedMock,
        onError: onErrorMock
      })
    )

    await act(async () => {
      await result.current.createFolder('')
    })

    expect(createFolderAction).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(onErrorMock).toHaveBeenCalledWith('folder_name_required')
    expect(onCompletedMock).not.toHaveBeenCalled()
  })

  test('should handle existing folder name', async () => {
    useSelector.mockImplementation(() => ({
      data: {
        customFolders: { 'existing-folder': {} }
      },
      isFolderLoading: false
    }))

    const { result } = renderHook(() =>
      useCreateFolder({
        onCompleted: onCompletedMock,
        onError: onErrorMock
      })
    )

    await act(async () => {
      await result.current.createFolder('existing-folder')
    })

    expect(createFolderAction).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(onErrorMock).toHaveBeenCalledWith('folder_name_exists')
    expect(onCompletedMock).not.toHaveBeenCalled()
  })

  test('should handle error from action dispatch', async () => {
    createFolderAction.mockReturnValue('create-action')
    mockDispatch.mockResolvedValue({ error: 'some-error', payload: null })

    const { result } = renderHook(() =>
      useCreateFolder({
        onCompleted: onCompletedMock,
        onError: onErrorMock
      })
    )

    await act(async () => {
      await result.current.createFolder('test-folder')
    })

    expect(createFolderAction).toHaveBeenCalledWith('test-folder')
    expect(mockDispatch).toHaveBeenCalledWith('create-action')
    expect(onCompletedMock).not.toHaveBeenCalled()
  })
})
