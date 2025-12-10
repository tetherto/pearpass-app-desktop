import { createAsyncThunk } from '@reduxjs/toolkit'

import { addBlindMirrors as addBlindMirrorsApi } from '../api/addBlindMirrors'
import { getBlindMirrors as getBlindMirrorsApi } from '../api/getBlindMirrors'

export const addBlindMirrors = createAsyncThunk(
  'blindMirrors/addBlindMirrors',
  async (blindMirrors) => {
    await addBlindMirrorsApi(blindMirrors)
    return getBlindMirrorsApi()
  }
)
