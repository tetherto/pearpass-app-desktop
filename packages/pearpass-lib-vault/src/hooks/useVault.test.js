import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useVault } from './useVault'
import { addDevice as addDeviceAction } from '../actions/addDevice'
import { getVaultById } from '../actions/getVaultById'
import { resetState } from '../actions/resetState'
import { updateProtectedVault } from '../actions/updateProtectedVault'
import { updateUnprotectedVault } from '../actions/updateUnprotectedVault'
import { checkVaultIsProtected } from '../api/checkVaultIsProtected'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/getVaultById', () => ({
  getVaultById: jest.fn()
}))

jest.mock('../actions/resetState', () => ({
  resetState: jest.fn()
}))

jest.mock('../actions/updateProtectedVault', () => ({
  updateProtectedVault: jest.fn()
}))

jest.mock('../actions/updateUnprotectedVault', () => ({
  updateUnprotectedVault: jest.fn()
}))

jest.mock('../actions/addDevice', () => ({
  addDevice: jest.fn()
}))

jest.mock('../api/initListener', () => ({
  initListener: jest.fn()
}))

jest.mock('../api/checkVaultIsProtected', () => ({
  checkVaultIsProtected: jest.fn()
}))

describe('useVault', () => {
  const mockDispatch = jest.fn()
  const mockVault = { id: 'vault-123', name: 'Test Vault' }

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    getVaultById.mockReturnValue({ type: 'GET_VAULT' })
    mockDispatch.mockResolvedValue({ payload: mockVault })
  })

  test('should return initial state', () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectVaults') {
        return { isLoading: false, isInitialized: true, isInitializing: false }
      }
      return { isLoading: false, data: null, isInitialized: true }
    })

    const { result } = renderHook(() => useVault())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(result.current.isInitialized).toBe(true)
    expect(typeof result.current.refetch).toBe('function')
    expect(typeof result.current.isVaultProtected).toBe('function')
    expect(typeof result.current.resetState).toBe('function')
  })

  test('should not fetch vault when shouldSkip is true', () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectVaults') {
        return { isLoading: false, isInitialized: true, isInitializing: false }
      }
      return { isLoading: false, data: null }
    })

    renderHook(() =>
      useVault({ variables: { vaultId: 'vault-123' }, shouldSkip: true })
    )

    expect(getVaultById).not.toHaveBeenCalled()
  })

  test('refetch should fetch vault with provided vaultId', async () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectVaults') {
        return { isLoading: false, isInitialized: true, isInitializing: false }
      }
      return { isLoading: false, data: null }
    })

    const { result } = renderHook(() => useVault())

    await act(async () => {
      await result.current.refetch('new-vault-id', { password: 'password123' })
    })

    expect(getVaultById).toHaveBeenCalledWith({
      vaultId: 'new-vault-id',
      params: { password: 'password123' }
    })
  })

  test('refetch throw error if getVaultById returns error', async () => {
    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectVaults') {
        return { isLoading: false, isInitialized: true, isInitializing: false }
      }
      return { isLoading: false, data: null }
    })

    getVaultById.mockReturnValue({ type: 'GET_VAULT', error: true })
    mockDispatch.mockResolvedValue({ error: true })

    const { result } = renderHook(() => useVault())

    await expect(result.current.refetch('vault-123')).rejects.toThrow(
      'Error fetching vault'
    )
  })

  test('isVaultProtected should return true for protected vaults', async () => {
    checkVaultIsProtected.mockResolvedValue(true)

    const { result } = renderHook(() => useVault())

    let isProtected
    await act(async () => {
      isProtected = await result.current.isVaultProtected('vault-123')
    })

    expect(isProtected).toBe(true)
  })

  test('resetState should dispatch resetState action', () => {
    resetState.mockReturnValue({ type: 'RESET_STATE' })

    const { result } = renderHook(() => useVault())

    act(() => {
      result.current.resetState()
    })

    expect(resetState).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET_STATE' })
  })

  test('updateProtectedVault should update the vault with provided data', async () => {
    const mockVaultUpdate = {
      name: 'Updated Vault',
      password: 'new-password',
      currentPassword: 'current-password'
    }

    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectVaults') {
        return { isLoading: false, isInitialized: true, isInitializing: false }
      }
      return { isLoading: false, data: mockVault }
    })

    const { result } = renderHook(() => useVault())

    await act(async () => {
      await result.current.updateProtectedVault('vault-123', mockVaultUpdate)
    })

    expect(updateProtectedVault).toHaveBeenCalledWith({
      vaultId: 'vault-123',
      name: 'Updated Vault',
      currentPassword: 'current-password',
      newPassword: 'new-password'
    })
  })

  test('updateProtectedVault should throw error if updateProtectedVault action fails', async () => {
    const mockVaultUpdate = {
      name: 'Updated Vault',
      password: 'new-password',
      currentPassword: 'current-password'
    }

    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectVaults') {
        return { isLoading: false, isInitialized: true, isInitializing: false }
      }
      return { isLoading: false, data: mockVault }
    })

    mockDispatch.mockResolvedValueOnce({ error: true })

    const { result } = renderHook(() => useVault())

    await expect(
      result.current.updateProtectedVault('vault-123', mockVaultUpdate)
    ).rejects.toThrow('Error updating vault')
  })

  test('addDevice should add a device to the vault', async () => {
    const mockDevice = 'IOS 15.6.0'

    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectVaults') {
        return { isLoading: false, isInitialized: true, isInitializing: false }
      }
      return { isLoading: false, data: mockVault }
    })

    addDeviceAction.mockReturnValue({ type: 'ADD_DEVICE' })

    const { result } = renderHook(() => useVault())

    await act(async () => {
      await result.current.addDevice(mockDevice)
    })

    expect(addDeviceAction).toHaveBeenCalledWith(mockDevice)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_DEVICE' })
  })

  test('addDevice should throw error if adding device fails', async () => {
    const mockDevice = 'IOS 15.6.0'

    useSelector.mockImplementation((selector) => {
      if (selector.name === 'selectVaults') {
        return { isLoading: false, isInitialized: true, isInitializing: false }
      }
      return { isLoading: false, data: mockVault }
    })

    addDeviceAction.mockReturnValue({ type: 'ADD_DEVICE' })
    mockDispatch.mockResolvedValueOnce({ error: true })

    const { result } = renderHook(() => useVault())

    await expect(
      result.current.addDevice('vault-123', mockDevice)
    ).rejects.toThrow('Error adding device to device list in vault')
  })
})
