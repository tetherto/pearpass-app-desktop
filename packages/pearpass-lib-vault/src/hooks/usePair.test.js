import { renderHook, act } from '@testing-library/react'
import { useDispatch } from 'react-redux'

import { usePair } from './usePair'
import { getVaultById } from '../actions/getVaultById'
import { cancelPairActiveVault as cancelPairActiveVaultApi } from '../api/cancelPairActiveVault'
import { initListener } from '../api/initListener'
import { pairActiveVault as pairActiveVaultApi } from '../api/pairActiveVault'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn()
}))

jest.mock('../actions/getVaultById', () => ({
  getVaultById: jest.fn()
}))

jest.mock('../api/cancelPairActiveVault', () => ({
  cancelPairActiveVault: jest.fn()
}))

jest.mock('../api/initListener', () => ({
  initListener: jest.fn()
}))

jest.mock('../api/pairActiveVault', () => ({
  pairActiveVault: jest.fn()
}))

describe('usePair', () => {
  let mockDispatch

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
    mockDispatch = jest.fn()
    useDispatch.mockReturnValue(mockDispatch)
  })

  it('should have initial state with isLoading as false', () => {
    const { result } = renderHook(() => usePair())
    expect(result.current.isLoading).toBe(false)
  })

  describe('pairActiveVault', () => {
    it('should pair successfully and initialize listener', async () => {
      const inviteCode = 'test-invite'
      const vaultId = 'test-vault-id'
      pairActiveVaultApi.mockResolvedValue(vaultId)
      getVaultById.mockReturnValue('GET_VAULT_ACTION')

      const { result } = renderHook(() => usePair())

      let promise
      act(() => {
        promise = result.current.pairActiveVault(inviteCode)
      })

      expect(result.current.isLoading).toBe(true)

      let returnedVaultId
      await act(async () => {
        returnedVaultId = await promise
      })

      expect(pairActiveVaultApi).toHaveBeenCalledWith(inviteCode)
      expect(initListener).toHaveBeenCalledWith({
        vaultId,
        onUpdate: expect.any(Function)
      })
      expect(result.current.isLoading).toBe(false)
      expect(returnedVaultId).toBe(vaultId)

      // Test the onUpdate callback
      const onUpdateCallback = initListener.mock.calls[0][0].onUpdate
      onUpdateCallback()
      expect(mockDispatch).toHaveBeenCalledWith(getVaultById({ vaultId }))
    })

    it('should handle API errors during pairing', async () => {
      const inviteCode = 'test-invite'
      const error = new Error('Pairing failed')
      pairActiveVaultApi.mockRejectedValue(error)

      const { result } = renderHook(() => usePair())

      await expect(
        act(async () => {
          await result.current.pairActiveVault(inviteCode)
        })
      ).rejects.toThrow('Pairing failed')

      expect(result.current.isLoading).toBe(false)
      expect(cancelPairActiveVaultApi).not.toHaveBeenCalled()
    })

    it('should handle timeout and cancel pairing', async () => {
      jest.useFakeTimers()
      const inviteCode = 'test-invite'
      pairActiveVaultApi.mockReturnValue(new Promise(() => {})) // a promise that never resolves

      const { result } = renderHook(() => usePair())

      let promise
      act(() => {
        promise = result.current.pairActiveVault(inviteCode)
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        jest.advanceTimersByTime(10000)
        await expect(promise).rejects.toThrow('Request timed out')
      })

      expect(result.current.isLoading).toBe(false)
      expect(cancelPairActiveVaultApi).toHaveBeenCalled()
      jest.useRealTimers()
    })
  })

  describe('cancelPairActiveVault', () => {
    it('should call cancelPairActiveVaultApi and set isLoading to false', async () => {
      const { result } = renderHook(() => usePair())

      await act(async () => {
        await result.current.cancelPairActiveVault()
      })

      expect(cancelPairActiveVaultApi).toHaveBeenCalled()
      expect(result.current.isLoading).toBe(false)
    })
  })
})
