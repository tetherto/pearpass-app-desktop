import { renderHook, act } from '@testing-library/react'
import { useSelector, useDispatch } from 'react-redux'

import { useRecords } from './useRecords'
import { deleteRecords as deleteRecordsAction } from '../actions/deleteRecords'
import { getVaultById } from '../actions/getVaultById'
import {
  updateRecords as updateRecordAction,
  updateFolder as updateFolderAction,
  updateFavoriteState as updateFavoriteStateAction
} from '../actions/updateRecords'
import { selectRecords } from '../selectors/selectRecords'
import { selectVault } from '../selectors/selectVault'

jest.mock('react-redux')
jest.mock('../actions/getVaultById')
jest.mock('../selectors/selectRecords')
jest.mock('../selectors/selectVault')

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/updateRecords', () => ({
  updateRecords: jest.fn(),
  updateFolder: jest.fn(),
  updateFavoriteState: jest.fn()
}))

jest.mock('../actions/deleteRecords', () => ({
  deleteRecords: jest.fn()
}))

describe('useRecords', () => {
  const mockDispatch = jest.fn()
  const mockOnCompleted = jest.fn()
  const mockVaultId = 'test-vault-id'
  const mockData = [{ records: [{ id: 1 }, { id: 2 }] }]
  const mockPayload = [{ id: mockVaultId, records: mockData.records }]
  const onCompletedMock = jest.fn()
  const deletemockPayload = ['record-123']

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    getVaultById.mockReturnValue({ type: 'GET_VAULT_BY_ID' })
    mockDispatch.mockResolvedValue({ payload: mockPayload, error: null })

    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { data: { id: mockVaultId } }
      }
      return { isLoading: false, data: mockData }
    })

    selectRecords.mockReturnValue(() => ({ isLoading: false, data: mockData }))
  })

  it('should return initial state', () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    const { result } = renderHook(() =>
      useRecords({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(result.current).toEqual({
      isLoading: true,
      data: null,
      refetch: expect.any(Function),
      updateFolder: expect.any(Function),
      updateRecords: expect.any(Function),
      updateFavoriteState: expect.any(Function),
      deleteRecords: expect.any(Function)
    })
  })

  it('should fetch vault data on initial render', () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    renderHook(() =>
      useRecords({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GET_VAULT_BY_ID' })
    expect(getVaultById).toHaveBeenCalledWith({ vaultId: mockVaultId })
  })

  it('should not fetch vault data if shouldSkip is true', () => {
    renderHook(() =>
      useRecords({
        shouldSkip: true,
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should not fetch vault data if data is already present', () => {
    renderHook(() =>
      useRecords({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should call onCompleted callback after successful fetch', async () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    renderHook(() =>
      useRecords({
        onCompleted: mockOnCompleted,
        variables: { vaultId: mockVaultId }
      })
    )

    await Promise.resolve()

    expect(mockOnCompleted).toHaveBeenCalledWith(mockPayload)
  })

  it('should refetch data when refetch is called', async () => {
    const { result } = renderHook(() =>
      useRecords({
        variables: { vaultId: mockVaultId }
      })
    )

    mockDispatch.mockClear()

    act(() => {
      result.current.refetch()
    })

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GET_VAULT_BY_ID' })
  })

  it('should apply filters and sort from variables', () => {
    const filters = {
      searchPattern: 'test',
      type: 'password',
      folder: 'personal',
      isFavorite: true
    }

    const sort = {
      field: 'name',
      direction: 'asc'
    }

    renderHook(() =>
      useRecords({
        variables: {
          vaultId: mockVaultId,
          filters,
          sort
        }
      })
    )

    expect(selectRecords).toHaveBeenCalledWith({
      filters,
      sort
    })
  })

  test('updateRecord should dispatch the action and call onCompleted on success', async () => {
    const mockResponse = { error: false, payload: { id: '123' } }
    mockDispatch.mockResolvedValue(mockResponse)
    updateRecordAction.mockReturnValue('UPDATE_RECORD_ACTION')

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useRecords({ onCompleted: onCompletedMock })
    )

    const record = { id: '123', name: 'Test Record' }
    await act(async () => {
      await result.current.updateRecords(record)
    })

    expect(updateRecordAction).toHaveBeenCalledWith(record)
    expect(mockDispatch).toHaveBeenCalledWith('UPDATE_RECORD_ACTION')
    expect(onCompletedMock).toHaveBeenCalledWith(mockResponse.payload)
  })

  test('updateRecord should not call onCompleted on error', async () => {
    const mockResponse = { error: true, payload: null }
    mockDispatch.mockResolvedValue(mockResponse)

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useRecords({ onCompleted: onCompletedMock })
    )

    await expect(
      act(async () => {
        await result.current.updateRecords({ id: '123' })
      })
    ).rejects.toThrow('Failed to update records')

    expect(onCompletedMock).not.toHaveBeenCalled()
  })

  test('updateFolder should dispatch the action and call onCompleted on success', async () => {
    const mockResponse = { error: false, payload: { id: '123' } }
    mockDispatch.mockResolvedValue(mockResponse)
    updateFolderAction.mockReturnValue('UPDATE_FOLDER_ACTION')

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useRecords({ onCompleted: onCompletedMock })
    )

    await act(async () => {
      await result.current.updateFolder('123', 'Test Folder')
    })

    expect(updateFolderAction).toHaveBeenCalledWith('123', 'Test Folder')
    expect(mockDispatch).toHaveBeenCalledWith('UPDATE_FOLDER_ACTION')
    expect(onCompletedMock).toHaveBeenCalledWith(mockResponse.payload)
  })

  test('updateFavoriteState should dispatch the action and call onCompleted on success', async () => {
    const mockResponse = { error: false, payload: { id: '123' } }
    mockDispatch.mockResolvedValue(mockResponse)
    updateFavoriteStateAction.mockReturnValue('UPDATE_FAVORITE_ACTION')

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useRecords({ onCompleted: onCompletedMock })
    )

    await act(async () => {
      await result.current.updateFavoriteState('123', true)
    })

    expect(updateFavoriteStateAction).toHaveBeenCalledWith('123', true)
    expect(mockDispatch).toHaveBeenCalledWith('UPDATE_FAVORITE_ACTION')
    expect(onCompletedMock).toHaveBeenCalledWith(mockResponse.payload)
  })

  test('should expose loading state from the vault selector', () => {
    useSelector.mockImplementation(() => ({ isLoading: true }))

    const { result } = renderHook(() => useRecords())

    expect(result.current.isLoading).toBe(true)
  })

  test('should call deleteRecordAction with recordIds', async () => {
    const recordIds = ['record-123']
    deleteRecordsAction.mockReturnValue('DELETE_RECORD_ACTION')

    const { result } = renderHook(() =>
      useRecords({ onCompleted: onCompletedMock })
    )

    await result.current.deleteRecords(recordIds)

    expect(deleteRecordsAction).toHaveBeenCalledWith(recordIds)
    expect(mockDispatch).toHaveBeenCalledWith('DELETE_RECORD_ACTION')
  })

  test('should call onCompleted callback when operation succeeds', async () => {
    const recordIds = ['record-123']

    mockDispatch.mockResolvedValue({ payload: recordIds, error: null })

    const { result } = renderHook(() =>
      useRecords({ onCompleted: onCompletedMock })
    )

    await result.current.deleteRecords(recordIds)

    expect(onCompletedMock).toHaveBeenCalledWith(deletemockPayload)
  })

  test('should not call onCompleted callback when operation fails', async () => {
    const recordIds = ['record-123']
    mockDispatch.mockResolvedValue({ error: 'Some error', payload: null })

    const { result } = renderHook(() =>
      useRecords({ onCompleted: onCompletedMock })
    )

    await result.current.deleteRecords(recordIds)

    expect(onCompletedMock).not.toHaveBeenCalled()
  })
})
