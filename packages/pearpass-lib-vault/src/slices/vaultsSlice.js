import { createSlice } from '@reduxjs/toolkit'

import { createVault } from '../actions/createVault'
import { getVaults } from '../actions/getVaults'
import { initializeVaults } from '../actions/initializeVaults'
import { resetState } from '../actions/resetState'
import { logger } from '../utils/logger'

const initialState = {
  isInitialized: false,
  isInitializing: false,
  isLoading: false,
  data: null,
  error: null
}

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialState,
  extraReducers: (builder) => {
    builder
      .addCase(initializeVaults.pending, (state) => {
        state.isLoading = true
        state.isInitializing = true
      })
      .addCase(initializeVaults.fulfilled, (state, action) => {
        state.data = action.payload
        state.isLoading = false
        state.isInitializing = false
        state.isInitialized = true
      })
      .addCase(initializeVaults.rejected, (state, action) => {
        logger.error(
          `Action initializeVaults error:`,
          JSON.stringify(action.error)
        )

        state.isLoading = false
        state.isInitializing = false
        state.error = action.error
      })

    builder
      .addCase(getVaults.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getVaults.fulfilled, (state, action) => {
        state.data = action.payload
        state.isLoading = false
      })
      .addCase(getVaults.rejected, (state, action) => {
        logger.error(`Action getVaults error:`, JSON.stringify(action.error))

        state.error = action.error
        state.isLoading = false
      })

    builder.addCase(createVault.fulfilled, (state, action) => {
      state.data.push(action.payload)
    })

    builder.addCase(resetState.fulfilled, (state) => {
      state.data = initialState.data
      state.error = initialState.error
      state.isLoading = initialState.isLoading
      state.isInitialized = initialState.isInitialized
      state.isInitializing = initialState.isInitializing
    })
  }
})

export default vaultsSlice.reducer
