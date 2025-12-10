import { createAsyncThunk } from '@reduxjs/toolkit'

export const resetState = createAsyncThunk('resetState', () => true)
