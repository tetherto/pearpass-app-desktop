import { renderHook, waitFor } from '@testing-library/react'
import { useUserData } from 'pearpass-lib-vault'

import { useRedirect } from './useRedirect'
import { useRouter } from '../../../context/RouterContext'

// Mock dependencies

jest.mock('pearpass-lib-vault')
jest.mock('../../../context/RouterContext')
jest.mock('../../../utils/logger', () => ({
  error: jest.fn()
}))
jest.mock('../../../constants/localStorage', () => ({
  LOCAL_STORAGE_KEYS: {
    TOU_ACCEPTED: 'TOU_ACCEPTED'
  }
}))

const mockNavigate = jest.fn()
const mockRefetchUser = jest.fn()

describe('useRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useRouter.mockReturnValue({ navigate: mockNavigate })
    useUserData.mockReturnValue({
      isLoading: false,
      refetch: mockRefetchUser
    })

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    })
  })

  it('should return isLoading as true when user data is loading', () => {
    useUserData.mockReturnValue({
      isLoading: true,
      refetch: mockRefetchUser
    })

    const { result } = renderHook(() => useRedirect())

    expect(result.current.isLoading).toBe(true)
  })

  it('should navigate to "welcome" with masterPassword state if password is set and ToU is accepted', async () => {
    mockRefetchUser.mockResolvedValue({ hasPasswordSet: true })
    localStorage.getItem.mockReturnValue('true')

    renderHook(() => useRedirect())

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('welcome', {
        state: 'masterPassword'
      })
    })
  })

  it('should navigate to "intro" if password is not set', async () => {
    mockRefetchUser.mockResolvedValue({ hasPasswordSet: false })
    localStorage.getItem.mockReturnValue('true') // ToU accepted doesn't matter here

    renderHook(() => useRedirect())

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('intro')
    })
  })

  it('should navigate to "intro" if user data is null', async () => {
    mockRefetchUser.mockResolvedValue(null)

    renderHook(() => useRedirect())

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('intro')
    })
  })
})
