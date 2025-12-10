import { createSlice } from '@reduxjs/toolkit'

import { fetchMasterPasswordStatus } from '../actions/fetchMasterPasswordStatus'
import { initializeUser } from '../actions/initializeUser'
import { resetState } from '../actions/resetState'
import { logger } from '../utils/logger'

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

export const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.data = {
          ...state.data,
          isLoggedIn: action.payload.isLoggedIn,
          isVaultOpen: action.payload.isVaultOpen,
          hasPasswordSet: action.payload.hasPasswordSet,
          masterPasswordStatus: action.payload.masterPasswordStatus
        }
        state.isLoading = false
        state.isInitialized = true
        state.error = null
      })
      .addCase(initializeUser.rejected, (state, action) => {
        logger.error(action.error)

        state.isLoading = false
        state.error = action.error
      })
      .addCase(fetchMasterPasswordStatus.fulfilled, (state, action) => {
        state.data.masterPasswordStatus = action.payload
      })

    builder.addCase(resetState.fulfilled, (state) => {
      state.isLoading = initialState.isLoading
      state.isInitialized = initialState.isInitialized
      state.error = initialState.error
      state.data = initialState.data
    })
  }
})

export const { setLoading } = userSlice.actions

export default userSlice.reducer
