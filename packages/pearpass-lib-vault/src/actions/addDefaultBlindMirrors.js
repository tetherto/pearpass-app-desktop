import { createAsyncThunk } from '@reduxjs/toolkit'

import { addDefaultBlindMirrors as addDefaultBlindMirrorsApi } from '../api/addDefaultBlindMirrors'
import { getBlindMirrors as getBlindMirrorsApi } from '../api/getBlindMirrors'

export const addDefaultBlindMirrors = createAsyncThunk(
  'blindMirrors/addDefaultBlindMirrors',
  async () => {
    await addDefaultBlindMirrorsApi()
    return getBlindMirrorsApi()
  }
)
