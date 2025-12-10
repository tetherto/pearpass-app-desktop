import userReducer, { setLoading } from './userSlice'
import { initializeUser } from '../actions/initializeUser'
import { resetState } from '../actions/resetState'

describe('userSlice', () => {
  const initialState = {
    isLoading: false,
    isInitialized: false,
    error: null,
    data: {
      hasPasswordSet: false,
      isLoggedIn: false,
      isVaultOpen: false,
      masterPasswordStatus: null
    }
  }

  it('should return the initial state', () => {
    expect(userReducer(undefined, { type: undefined })).toEqual(initialState)
  })

  it('should handle setLoading', () => {
    const actual = userReducer(initialState, setLoading(true))
    expect(actual.isLoading).toEqual(true)
  })

  it('should handle initializeUser.pending', () => {
    const actual = userReducer(initialState, {
      type: initializeUser.pending.type
    })
    expect(actual.isLoading).toEqual(true)
  })

  it('should handle initializeUser.fulfilled', () => {
    const actual = userReducer(initialState, {
      type: initializeUser.fulfilled.type,
      payload: {
        hasPasswordSet: true,
        isLoggedIn: true,
        isVaultOpen: true
      }
    })
    expect(actual.isLoading).toBe(false)
    expect(actual.isInitialized).toBe(true)
    expect(actual.error).toBe(null)
    expect(actual.data.hasPasswordSet).toBe(true)
    expect(actual.data.isLoggedIn).toBe(true)
    expect(actual.data.isVaultOpen).toBe(true)
  })

  it('should handle initializeUser.rejected', () => {
    const testError = new Error('Test error')
    const actual = userReducer(initialState, {
      type: initializeUser.rejected.type,
      error: testError
    })
    expect(actual.isLoading).toBe(false)
    expect(actual.error).toEqual(testError)
  })

  it('should handle resetState.fulfilled', () => {
    const modifiedState = {
      isLoading: true,
      isInitialized: true,
      error: new Error('Test error'),
      data: {
        hasPasswordSet: true
      }
    }

    const actual = userReducer(modifiedState, {
      type: resetState.fulfilled.type
    })
    expect(actual).toEqual(initialState)
  })
})
