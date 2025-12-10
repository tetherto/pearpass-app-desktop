import { configureStore } from '@reduxjs/toolkit'

import vaultReducer from './vaultSlice'
import { addDevice } from '../actions/addDevice'
import { createFolder } from '../actions/createFolder'
import { createRecord } from '../actions/createRecord'
import { createVault } from '../actions/createVault'
import { deleteFolder } from '../actions/deleteFolder'
import { deleteRecords } from '../actions/deleteRecords'
import { getVaultById } from '../actions/getVaultById'
import { renameFolder } from '../actions/renameFolder'
import { resetState } from '../actions/resetState'
import { updateProtectedVault } from '../actions/updateProtectedVault'
import { updateRecords } from '../actions/updateRecords'
import { updateUnprotectedVault } from '../actions/updateUnprotectedVault'

jest.mock('../actions/createFolder', () => ({
  createFolder: {
    pending: { type: 'createFolder/pending' },
    fulfilled: { type: 'createFolder/fulfilled' },
    rejected: { type: 'createFolder/rejected' }
  }
}))
jest.mock('../actions/createRecord', () => ({
  createRecord: {
    pending: { type: 'createRecord/pending' },
    fulfilled: { type: 'createRecord/fulfilled' },
    rejected: { type: 'createRecord/rejected' }
  }
}))
jest.mock('../actions/createVault', () => ({
  createVault: {
    pending: { type: 'createVault/pending' },
    fulfilled: { type: 'createVault/fulfilled' },
    rejected: { type: 'createVault/rejected' }
  }
}))
jest.mock('../actions/deleteFolder', () => ({
  deleteFolder: {
    pending: { type: 'deleteFolder/pending' },
    fulfilled: { type: 'deleteFolder/fulfilled' },
    rejected: { type: 'deleteFolder/rejected' }
  }
}))
jest.mock('../actions/deleteRecords', () => ({
  deleteRecords: {
    pending: { type: 'deleteRecords/pending' },
    fulfilled: { type: 'deleteRecords/fulfilled' },
    rejected: { type: 'deleteRecords/rejected' }
  }
}))
jest.mock('../actions/getVaultById', () => ({
  getVaultById: {
    pending: { type: 'getVaultById/pending' },
    fulfilled: { type: 'getVaultById/fulfilled' },
    rejected: { type: 'getVaultById/rejected' }
  }
}))
jest.mock('../actions/renameFolder', () => ({
  renameFolder: {
    pending: { type: 'renameFolder/pending' },
    fulfilled: { type: 'renameFolder/fulfilled' },
    rejected: { type: 'renameFolder/rejected' }
  }
}))
jest.mock('../actions/resetState', () => ({
  resetState: { fulfilled: { type: 'resetState/fulfilled' } }
}))
jest.mock('../actions/updateRecords', () => ({
  updateRecords: {
    pending: { type: 'updateRecords/pending' },
    fulfilled: { type: 'updateRecords/fulfilled' },
    rejected: { type: 'updateRecords/rejected' }
  }
}))
jest.mock('../actions/addDevice', () => ({
  addDevice: {
    pending: { type: 'addDevice/pending' },
    fulfilled: { type: 'addDevice/fulfilled' },
    rejected: { type: 'addDevice/rejected' }
  }
}))
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))
jest.mock('../actions/updateProtectedVault', () => ({
  updateProtectedVault: {
    pending: { type: 'updateProtectedVault/pending' },
    fulfilled: { type: 'updateProtectedVault/fulfilled' },
    rejected: { type: 'updateProtectedVault/rejected' }
  }
}))
jest.mock('../actions/updateUnprotectedVault', () => ({
  updateUnprotectedVault: {
    pending: { type: 'updateUnprotectedVault/pending' },
    fulfilled: { type: 'updateUnprotectedVault/fulfilled' },
    rejected: { type: 'updateUnprotectedVault/rejected' }
  }
}))

describe('vaultSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        vault: vaultReducer
      }
    })
    jest.clearAllMocks()
  })

  it('should handle initial state', () => {
    expect(store.getState().vault).toEqual({
      isLoading: false,
      isInitialized: false,
      isRecordLoading: false,
      isFolderLoading: false,
      isDeviceLoading: false,
      data: null,
      error: null
    })
  })

  describe('getVaultById', () => {
    it('should handle pending state', () => {
      store.dispatch({ type: getVaultById.pending.type })
      expect(store.getState().vault.isLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockVault = { id: '123', records: [] }
      store.dispatch({ type: getVaultById.fulfilled.type, payload: mockVault })
      expect(store.getState().vault.isLoading).toBe(false)
      expect(store.getState().vault.isInitialized).toBe(true)
      expect(store.getState().vault.data).toEqual(mockVault)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to fetch vault' }
      store.dispatch({ type: getVaultById.rejected.type, error: mockError })
      expect(store.getState().vault.isLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('createVault', () => {
    it('should handle pending state', () => {
      store.dispatch({ type: createVault.pending.type })
      expect(store.getState().vault.isLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockVault = { id: '123', records: [] }
      store.dispatch({ type: createVault.fulfilled.type, payload: mockVault })
      expect(store.getState().vault.isLoading).toBe(false)
      expect(store.getState().vault.data).toEqual(mockVault)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to create vault' }
      store.dispatch({ type: createVault.rejected.type, error: mockError })
      expect(store.getState().vault.isLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('createRecord', () => {
    beforeEach(() => {
      store.dispatch({
        type: getVaultById.fulfilled.type,
        payload: { id: '123', records: [] }
      })
    })

    it('should handle pending state', () => {
      store.dispatch({ type: createRecord.pending.type })
      expect(store.getState().vault.isRecordLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockRecord = { id: 'rec1', type: 'password' }
      store.dispatch({ type: createRecord.fulfilled.type, payload: mockRecord })
      expect(store.getState().vault.isRecordLoading).toBe(false)
      expect(store.getState().vault.data.records).toContain(mockRecord)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to create record' }
      store.dispatch({ type: createRecord.rejected.type, error: mockError })
      expect(store.getState().vault.isRecordLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('updateRecords', () => {
    beforeEach(() => {
      store.dispatch({
        type: getVaultById.fulfilled.type,
        payload: { id: '123', records: [{ id: 'rec1' }] }
      })
    })

    it('should handle pending state', () => {
      store.dispatch({ type: updateRecords.pending.type })
      expect(store.getState().vault.isRecordLoading).toBe(true)
      expect(store.getState().vault.error).toBeNull()
    })

    it('should handle fulfilled state', () => {
      const updatedRecords = [{ id: 'rec1', updated: true }, { id: 'rec2' }]
      store.dispatch({
        type: updateRecords.fulfilled.type,
        payload: updatedRecords
      })
      expect(store.getState().vault.isRecordLoading).toBe(false)
      expect(store.getState().vault.data.records).toEqual(updatedRecords)
    })

    it('should handle fulfilled state with no payload', () => {
      store.dispatch({ type: updateRecords.fulfilled.type })
      expect(store.getState().vault.isRecordLoading).toBe(false)
      expect(store.getState().vault.data.records).toEqual([])
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to update records' }
      store.dispatch({ type: updateRecords.rejected.type, error: mockError })
      expect(store.getState().vault.isRecordLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('deleteRecords', () => {
    beforeEach(() => {
      store.dispatch({
        type: getVaultById.fulfilled.type,
        payload: { id: '123', records: [{ id: 'rec1' }, { id: 'rec2' }] }
      })
    })

    it('should handle pending state', () => {
      store.dispatch({ type: deleteRecords.pending.type })
      expect(store.getState().vault.isRecordLoading).toBe(true)
      expect(store.getState().vault.error).toBeNull()
    })

    it('should handle fulfilled state', () => {
      const remainingRecords = [{ id: 'rec2' }]
      store.dispatch({
        type: deleteRecords.fulfilled.type,
        payload: remainingRecords
      })
      expect(store.getState().vault.isRecordLoading).toBe(false)
      expect(store.getState().vault.data.records).toEqual(remainingRecords)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to delete records' }
      store.dispatch({ type: deleteRecords.rejected.type, error: mockError })
      expect(store.getState().vault.isRecordLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('createFolder', () => {
    beforeEach(() => {
      store.dispatch({
        type: getVaultById.fulfilled.type,
        payload: { id: '123', records: [] }
      })
    })

    it('should handle pending state', () => {
      store.dispatch({ type: createFolder.pending.type })
      expect(store.getState().vault.isFolderLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockFolder = { id: 'folder1', type: 'folder', name: 'Test Folder' }
      store.dispatch({ type: createFolder.fulfilled.type, payload: mockFolder })
      expect(store.getState().vault.isFolderLoading).toBe(false)
      expect(store.getState().vault.data.records).toContain(mockFolder)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to create folder' }
      store.dispatch({ type: createFolder.rejected.type, error: mockError })
      expect(store.getState().vault.isFolderLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('renameFolder', () => {
    beforeEach(() => {
      store.dispatch({
        type: getVaultById.fulfilled.type,
        payload: {
          id: '123',
          records: [{ id: 'folder1', type: 'folder', name: 'Old Name' }]
        }
      })
    })

    it('should handle pending state', () => {
      store.dispatch({ type: renameFolder.pending.type })
      expect(store.getState().vault.isFolderLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const updatedRecords = [
        { id: 'folder1', type: 'folder', name: 'New Name' }
      ]
      store.dispatch({
        type: renameFolder.fulfilled.type,
        payload: updatedRecords
      })
      expect(store.getState().vault.isFolderLoading).toBe(false)
      expect(store.getState().vault.data.records).toEqual(updatedRecords)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to rename folder' }
      store.dispatch({ type: renameFolder.rejected.type, error: mockError })
      expect(store.getState().vault.isFolderLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('deleteFolder', () => {
    beforeEach(() => {
      store.dispatch({
        type: getVaultById.fulfilled.type,
        payload: { id: '123', records: [{ id: 'folder1', type: 'folder' }] }
      })
    })

    it('should handle pending state', () => {
      store.dispatch({ type: deleteFolder.pending.type })
      expect(store.getState().vault.isFolderLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const remainingRecords = []
      store.dispatch({
        type: deleteFolder.fulfilled.type,
        payload: remainingRecords
      })
      expect(store.getState().vault.isFolderLoading).toBe(false)
      expect(store.getState().vault.data.records).toEqual(remainingRecords)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to delete folder' }
      store.dispatch({ type: deleteFolder.rejected.type, error: mockError })
      expect(store.getState().vault.isFolderLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('addDevice', () => {
    beforeEach(() => {
      store.dispatch({
        type: getVaultById.fulfilled.type,
        payload: { id: '123', records: [], devices: [] }
      })
    })

    it('should handle pending state', () => {
      store.dispatch({ type: addDevice.pending.type })
      expect(store.getState().vault.isDeviceLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockDevice = {
        id: 'device1',
        vaultId: '123',
        data: 'ios',
        createdAt: Date.now()
      }
      store.dispatch({ type: addDevice.fulfilled.type, payload: mockDevice })
      expect(store.getState().vault.isDeviceLoading).toBe(false)
      expect(store.getState().vault.data.devices).toEqual(mockDevice)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to add device' }
      store.dispatch({ type: addDevice.rejected.type, error: mockError })
      expect(store.getState().vault.isDeviceLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('updateProtectedVault', () => {
    it('should handle pending state', () => {
      store.dispatch({ type: updateProtectedVault.pending.type })
      expect(store.getState().vault.isLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      store.dispatch({ type: updateProtectedVault.fulfilled.type })
      expect(store.getState().vault.isLoading).toBe(false)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to update protected vault' }
      store.dispatch({
        type: updateProtectedVault.rejected.type,
        error: mockError
      })
      expect(store.getState().vault.isLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('updateUnprotectedVault', () => {
    it('should handle pending state', () => {
      store.dispatch({ type: updateUnprotectedVault.pending.type })
      expect(store.getState().vault.isLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      store.dispatch({ type: updateUnprotectedVault.fulfilled.type })
      expect(store.getState().vault.isLoading).toBe(false)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Failed to update unprotected vault' }
      store.dispatch({
        type: updateUnprotectedVault.rejected.type,
        error: mockError
      })
      expect(store.getState().vault.isLoading).toBe(false)
      expect(store.getState().vault.error).toEqual(mockError)
    })
  })

  describe('resetState', () => {
    beforeEach(() => {
      store.dispatch({
        type: getVaultById.fulfilled.type,
        payload: { id: '123', records: [{ id: 'rec1' }] }
      })

      store.dispatch({
        type: createRecord.rejected.type,
        error: { message: 'Some error' }
      })
    })

    it('should reset state to initial values', () => {
      expect(store.getState().vault.data).not.toBeNull()
      expect(store.getState().vault.error).not.toBeNull()
      expect(store.getState().vault.isInitialized).toBe(true)

      store.dispatch({ type: resetState.fulfilled.type })

      expect(store.getState().vault).toEqual({
        isLoading: false,
        isInitialized: false,
        isRecordLoading: false,
        isFolderLoading: false,
        isDeviceLoading: false,
        data: null,
        error: null
      })
    })
  })
})
