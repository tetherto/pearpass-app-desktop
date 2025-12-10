import { createSlice } from '@reduxjs/toolkit'

import { createInvite } from '../actions/createInvite'
import { deleteInvite } from '../actions/deleteInvite'
import { resetState } from '../actions/resetState'
import { logger } from '../utils/logger'

const initialState = {
  isLoading: false,
  error: null,
  data: null
}

const setPending = (state) => {
  state.isLoading = true
  state.error = null
}

const setFulfilled = (state, { payload }) => {
  state.isLoading = false
  state.data = payload
}

const setRejected = (state, action) => {
  logger.error(action.error)
  state.isLoading = false
  state.error = action.error
}

export const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(createInvite.pending, setPending)
      .addCase(createInvite.fulfilled, setFulfilled)
      .addCase(createInvite.rejected, setRejected)
      .addCase(deleteInvite.pending, setPending)
      .addCase(deleteInvite.fulfilled, setFulfilled)
      .addCase(deleteInvite.rejected, setRejected)
      .addCase(resetState.fulfilled, (state) => {
        Object.assign(state, initialState)
      })
  }
})

export default vaultSlice.reducer
