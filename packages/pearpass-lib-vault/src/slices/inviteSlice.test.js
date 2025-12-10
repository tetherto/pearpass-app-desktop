import reducer from './inviteSlice'
import { createInvite } from '../actions/createInvite'
import { deleteInvite } from '../actions/deleteInvite'
import { resetState } from '../actions/resetState'

jest.mock('../actions/createInvite', () => ({
  createInvite: {
    pending: { type: 'createInvite/pending' },
    fulfilled: { type: 'createInvite/fulfilled' },
    rejected: { type: 'createInvite/rejected' }
  }
}))

jest.mock('../actions/deleteInvite', () => ({
  deleteInvite: {
    pending: { type: 'deleteInvite/pending' },
    fulfilled: { type: 'deleteInvite/fulfilled' },
    rejected: { type: 'deleteInvite/rejected' }
  }
}))

jest.mock('../actions/resetState', () => ({
  resetState: {
    fulfilled: { type: 'resetState/fulfilled' }
  }
}))

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

describe('inviteSlice', () => {
  const initialState = {
    isLoading: false,
    error: null,
    data: null
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState)
  })

  describe('createInvite', () => {
    it('should handle pending state', () => {
      const action = { type: createInvite.pending.type }
      const state = reducer(initialState, action)
      expect(state).toEqual({
        isLoading: true,
        error: null,
        data: null
      })
    })

    it('should handle fulfilled state', () => {
      const payload = { inviteId: '123', email: 'test@example.com' }
      const action = { type: createInvite.fulfilled.type, payload }
      const state = reducer(initialState, action)
      expect(state).toEqual({
        isLoading: false,
        error: null,
        data: payload
      })
    })

    it('should handle rejected state', () => {
      const error = { message: 'Failed to create invite' }
      const action = { type: createInvite.rejected.type, error }
      const state = reducer(initialState, action)
      expect(state).toEqual({
        isLoading: false,
        error,
        data: null
      })
    })
  })

  describe('deleteInvite', () => {
    it('should handle pending state', () => {
      const action = { type: deleteInvite.pending.type }
      const state = reducer(initialState, action)
      expect(state).toEqual({
        isLoading: true,
        error: null,
        data: null
      })
    })

    it('should handle fulfilled state', () => {
      const payload = { success: true }
      const action = { type: deleteInvite.fulfilled.type, payload }
      const state = reducer(initialState, action)
      expect(state).toEqual({
        isLoading: false,
        error: null,
        data: payload
      })
    })

    it('should handle rejected state', () => {
      const error = { message: 'Failed to delete invite' }
      const action = { type: deleteInvite.rejected.type, error }
      const state = reducer(initialState, action)
      expect(state).toEqual({
        isLoading: false,
        error,
        data: null
      })
    })
  })

  describe('resetState', () => {
    it('should reset state to initial state', () => {
      const modifiedState = {
        isLoading: true,
        error: { message: 'Some error' },
        data: { inviteId: '123' }
      }
      const action = { type: resetState.fulfilled.type }
      const state = reducer(modifiedState, action)
      expect(state).toEqual(initialState)
    })
  })
})
