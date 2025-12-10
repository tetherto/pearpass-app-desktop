import { configureStore } from '@reduxjs/toolkit'

import vaultsReducer from './vaultsSlice'
import { createVault } from '../actions/createVault'
import { getVaults } from '../actions/getVaults'
import { initializeVaults } from '../actions/initializeVaults'
import { resetState } from '../actions/resetState'
import { logger } from '../utils/logger'

jest.mock('../actions/createVault', () => ({
  createVault: {
    pending: { type: 'createVault/pending' },
    fulfilled: { type: 'createVault/fulfilled' },
    rejected: { type: 'createVault/rejected' }
  }
}))
jest.mock('../actions/getVaults', () => ({
  getVaults: {
    pending: { type: 'getVaults/pending' },
    fulfilled: { type: 'getVaults/fulfilled' },
    rejected: { type: 'getVaults/rejected' }
  }
}))
jest.mock('../actions/initializeVaults', () => ({
  initializeVaults: {
    pending: { type: 'initializeVaults/pending' },
    fulfilled: { type: 'initializeVaults/fulfilled' },
    rejected: { type: 'initializeVaults/rejected' }
  }
}))
jest.mock('../actions/resetState', () => ({
  resetState: { fulfilled: { type: 'resetState/fulfilled' } }
}))
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

describe('vaultsSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        vaults: vaultsReducer
      }
    })
    jest.clearAllMocks()
  })

  it('should handle initial state', () => {
    expect(store.getState().vaults).toEqual({
      isInitialized: false,
      isInitializing: false,
      isLoading: false,
      data: null,
      error: null
    })
  })

  describe('initializeVaults', () => {
    it('should handle pending state', () => {
      store.dispatch({ type: initializeVaults.pending.type })
      expect(store.getState().vaults.isLoading).toBe(true)
      expect(store.getState().vaults.isInitializing).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockVaults = [{ id: '123', name: 'Vault 1' }]
      store.dispatch({
        type: initializeVaults.fulfilled.type,
        payload: mockVaults
      })
      expect(store.getState().vaults.isLoading).toBe(false)
      expect(store.getState().vaults.isInitializing).toBe(false)
      expect(store.getState().vaults.isInitialized).toBe(true)
      expect(store.getState().vaults.data).toEqual(mockVaults)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to initialize vaults' }
      store.dispatch({ type: initializeVaults.rejected.type, error: mockError })
      expect(store.getState().vaults.isLoading).toBe(false)
      expect(store.getState().vaults.isInitializing).toBe(false)
      expect(store.getState().vaults.error).toEqual(mockError)
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('getVaults', () => {
    it('should handle pending state', () => {
      store.dispatch({ type: getVaults.pending.type })
      expect(store.getState().vaults.isLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockVaults = [{ id: '123', name: 'Vault 1' }]
      store.dispatch({ type: getVaults.fulfilled.type, payload: mockVaults })
      expect(store.getState().vaults.isLoading).toBe(false)
      expect(store.getState().vaults.data).toEqual(mockVaults)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to get vaults' }
      store.dispatch({ type: getVaults.rejected.type, error: mockError })
      expect(store.getState().vaults.error).toEqual(mockError)
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('createVault', () => {
    beforeEach(() => {
      // Set initial data to empty array
      store.dispatch({ type: initializeVaults.fulfilled.type, payload: [] })
    })

    it('should add new vault to data array', () => {
      const newVault = { id: '456', name: 'New Vault' }
      store.dispatch({ type: createVault.fulfilled.type, payload: newVault })
      expect(store.getState().vaults.data).toEqual([newVault])
    })

    it('should append new vault to existing vaults', () => {
      const existingVault = { id: '123', name: 'Existing Vault' }
      const newVault = { id: '456', name: 'New Vault' }

      // Set initial data with existing vault
      store.dispatch({
        type: initializeVaults.fulfilled.type,
        payload: [existingVault]
      })

      // Add new vault
      store.dispatch({ type: createVault.fulfilled.type, payload: newVault })

      expect(store.getState().vaults.data).toEqual([existingVault, newVault])
    })
  })

  describe('resetState', () => {
    beforeEach(() => {
      // Set some non-initial state
      store.dispatch({
        type: initializeVaults.fulfilled.type,
        payload: [{ id: '123', name: 'Test Vault' }]
      })
    })

    it('should reset state to initial values', () => {
      // Verify state was changed
      expect(store.getState().vaults.isInitialized).toBe(true)
      expect(store.getState().vaults.data).not.toBeNull()

      // Reset state
      store.dispatch({ type: resetState.fulfilled.type })

      // Verify state was reset
      expect(store.getState().vaults).toEqual({
        isInitialized: false,
        isInitializing: false,
        isLoading: false,
        data: null,
        error: null
      })
    })
  })
})
