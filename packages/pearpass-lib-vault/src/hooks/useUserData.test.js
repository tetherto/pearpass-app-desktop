import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useUserData } from './useUserData'
import { initializeUser } from '../actions/initializeUser'
import { createMasterPassword as createMasterPasswordApi } from '../api/createMasterPassword'
import { init } from '../api/init'
import { updateMasterPassword as updateMasterPasswordApi } from '../api/updateMasterPassword'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/initializeUser', () => ({
  initializeUser: jest.fn()
}))

jest.mock('../api/createMasterPassword', () => ({
  createMasterPassword: jest.fn()
}))

jest.mock('../api/updateMasterPassword', () => ({
  updateMasterPassword: jest.fn()
}))

jest.mock('../api/init', () => ({
  init: jest.fn()
}))

jest.mock('../slices/userSlice', () => ({
  setLoading: jest.fn()
}))

describe('useUserData', () => {
  const dispatchMock = jest.fn()
  const mockUserData = {
    isLoading: false,
    isInitialized: false,
    data: {
      hasPasswordSet: false
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(dispatchMock)
    useSelector.mockReturnValue(mockUserData)
    initializeUser.mockReturnValue({
      type: 'initializeUser',
      payload: {
        hasPasswordSet: true,
        isLoggedIn: true,
        isVaultOpen: true
      }
    })
    dispatchMock.mockResolvedValue({
      payload: {
        hasPasswordSet: true,
        isLoggedIn: true,
        isVaultOpen: true
      }
    })
  })

  test('should return correct initial state', () => {
    const { result } = renderHook(() => useUserData())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.hasPasswordSet).toBe(false)
    expect(typeof result.current.logIn).toBe('function')
    expect(typeof result.current.createMasterPassword).toBe('function')
  })

  test('should not check password state if shouldSkip is true', () => {
    renderHook(() => useUserData({ shouldSkip: true }))

    expect(dispatchMock).not.toHaveBeenCalled()
  })

  test('should not check password state if isInitialized is true', () => {
    useSelector.mockReturnValue({
      ...mockUserData,
      isLoading: false,
      isInitialized: true
    })

    renderHook(() => useUserData())

    expect(dispatchMock).not.toHaveBeenCalled()
  })

  test('logIn should call init and setLoading with password', async () => {
    const { result } = renderHook(() => useUserData())

    await act(async () => {
      await result.current.logIn({ password: 'password123' })
    })

    expect(init).toHaveBeenCalledWith({ password: 'password123' })
  })

  test('createMasterPassword should call API and setLoading', async () => {
    const { result } = renderHook(() => useUserData())

    await act(async () => {
      await result.current.createMasterPassword('password123')
    })

    expect(createMasterPasswordApi).toHaveBeenCalledWith('password123')
  })

  test('logIn should call init and setLoading with encryption fields', async () => {
    const { result } = renderHook(() => useUserData())

    await act(async () => {
      await result.current.logIn({
        ciphertext: 'ciphertext123',
        nonce: 'nonce123',
        salt: 'salt123',
        hashedPassword: 'hashedPassword123'
      })
    })

    expect(init).toHaveBeenCalledWith({
      ciphertext: 'ciphertext123',
      nonce: 'nonce123',
      salt: 'salt123',
      hashedPassword: 'hashedPassword123'
    })
  })

  test('updateMasterPassword should call API and setLoading', async () => {
    const { result } = renderHook(() => useUserData())

    await act(async () => {
      await result.current.updateMasterPassword({
        newPassword: 'newPassword123',
        currentPassword: 'currentPassword123'
      })
    })

    expect(updateMasterPasswordApi).toHaveBeenCalledWith({
      newPassword: 'newPassword123',
      currentPassword: 'currentPassword123'
    })
  })
})
