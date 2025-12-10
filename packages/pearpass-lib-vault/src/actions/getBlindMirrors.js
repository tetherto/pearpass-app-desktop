import { createAsyncThunk } from '@reduxjs/toolkit'

import { getBlindMirrors as getBlindMirrorsApi } from '../api/getBlindMirrors'

export const getBlindMirrors = createAsyncThunk(
  'blindMirrors/getBlindMirrors',
  async () => getBlindMirrorsApi()
)
