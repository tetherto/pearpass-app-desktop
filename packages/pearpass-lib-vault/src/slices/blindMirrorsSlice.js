import { createSlice } from '@reduxjs/toolkit'

import { addBlindMirrors } from '../actions/addBlindMirrors'
import { addDefaultBlindMirrors } from '../actions/addDefaultBlindMirrors'
import { getBlindMirrors } from '../actions/getBlindMirrors'
import { removeAllBlindMirrors } from '../actions/removeAllBlindMirrors'
import { removeBlindMirror } from '../actions/removeBlindMirror'

const initialState = {
  isLoading: false,
  error: null,
  data: []
}

export const blindMirrorsSlice = createSlice({
  name: 'blindMirrors',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBlindMirrors.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBlindMirrors.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload ?? []
        state.error = null
      })
      .addCase(getBlindMirrors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error
      })

    builder
      .addCase(addBlindMirrors.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addBlindMirrors.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload ?? []
        state.error = null
      })
      .addCase(addBlindMirrors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error
      })

    builder
      .addCase(removeBlindMirror.pending, (state) => {
        state.isLoading = true
      })
      .addCase(removeBlindMirror.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload ?? []
        state.error = null
      })
      .addCase(removeBlindMirror.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error
      })

    builder
      .addCase(removeAllBlindMirrors.pending, (state) => {
        state.isLoading = true
      })
      .addCase(removeAllBlindMirrors.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload ?? []
        state.error = null
      })
      .addCase(removeAllBlindMirrors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error
      })

    builder
      .addCase(addDefaultBlindMirrors.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addDefaultBlindMirrors.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload ?? []
        state.error = null
      })
      .addCase(addDefaultBlindMirrors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error
      })
  }
})

export default blindMirrorsSlice.reducer
