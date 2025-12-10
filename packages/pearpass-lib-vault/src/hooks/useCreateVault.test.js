import { renderHook, act } from '@testing-library/react'
import { useSelector, useDispatch } from 'react-redux'

import { useCreateVault } from './useCreateVault'
import { createVault as createVaultAction } from '../actions/createVault'
import { selectVault } from '../selectors/selectVault'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn()
}))

jest.mock('../actions/createVault', () => ({
  createVault: jest.fn()
}))

jest.mock('../selectors/selectVault', () => ({
  selectVault: jest.fn()
}))

describe('useCreateVault', () => {
  const mockDispatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isLoading: false }
      }
      return null
    })
    mockDispatch.mockResolvedValue({
      error: null,
      payload: { vault: { id: '123', name: 'Test Vault' } }
    })
  })

  it('should return isLoading state from selector', () => {
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isLoading: true }
      }
      return null
    })

    const { result } = renderHook(() => useCreateVault())

    expect(result.current.isLoading).toBe(true)
  })

  it('should call dispatch with the correct action when createVault is called', async () => {
    createVaultAction.mockReturnValue('MOCKED_ACTION')

    const { result } = renderHook(() => useCreateVault())

    await act(async () => {
      await result.current.createVault({
        name: 'New Vault',
        password: 'secret'
      })
    })

    expect(createVaultAction).toHaveBeenCalledWith({
      name: 'New Vault',
      password: 'secret'
    })
    expect(mockDispatch).toHaveBeenCalledWith('MOCKED_ACTION')
  })

  it('should return the vault payload when createVault succeeds', async () => {
    const mockVault = { id: '123', name: 'Test Vault' }
    mockDispatch.mockResolvedValue({
      error: null,
      payload: { vault: mockVault }
    })
    createVaultAction.mockReturnValue('MOCKED_ACTION')

    const { result } = renderHook(() => useCreateVault())

    let response
    await act(async () => {
      response = await result.current.createVault({
        name: 'Test Vault',
        password: 'secret'
      })
    })

    expect(response).toEqual({ vault: mockVault })
  })

  it('should throw error when createVault fails', async () => {
    const mockError = new Error('Failed to create vault')
    mockDispatch.mockResolvedValue({
      error: mockError,
      payload: null
    })
    createVaultAction.mockReturnValue('MOCKED_ACTION')

    const { result } = renderHook(() => useCreateVault())

    await expect(
      act(async () => {
        await result.current.createVault({
          name: 'Test Vault',
          password: 'secret'
        })
      })
    ).rejects.toThrow('Failed to create vault')
  })
})
