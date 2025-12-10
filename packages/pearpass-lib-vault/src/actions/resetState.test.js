import { configureStore } from '@reduxjs/toolkit'

import { resetState } from './resetState'

describe('resetState', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: (state = { reset: false }, action) => {
        if (action.type === 'resetState/fulfilled') {
          return { ...state, reset: true }
        }
        return state
      }
    })
  })

  it('should create an async thunk action', () => {
    expect(typeof resetState).toBe('function')
    expect(resetState.pending).toBeDefined()
    expect(resetState.fulfilled).toBeDefined()
    expect(resetState.rejected).toBeDefined()
  })

  it('should dispatch the action and return true', async () => {
    const result = await store.dispatch(resetState())
    expect(result.payload).toBe(true)
    expect(result.type).toBe('resetState/fulfilled')
  })

  it('should update the store state when fulfilled', async () => {
    expect(store.getState().reset).toBe(false)
    await store.dispatch(resetState())
    expect(store.getState().reset).toBe(true)
  })
})
