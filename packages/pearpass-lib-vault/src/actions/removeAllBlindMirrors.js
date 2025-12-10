import { createAsyncThunk } from '@reduxjs/toolkit'

import { getBlindMirrors as getBlindMirrorsApi } from '../api/getBlindMirrors'
import { removeAllBlindMirrors as removeAllBlindMirrorsApi } from '../api/removeAllBlindMirrors'

export const removeAllBlindMirrors = createAsyncThunk(
  'blindMirrors/removeAllBlindMirrors',
  async () => {
    await removeAllBlindMirrorsApi()
    return getBlindMirrorsApi()
  }
)
