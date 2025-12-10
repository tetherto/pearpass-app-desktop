import { createAsyncThunk } from '@reduxjs/toolkit'

import { getBlindMirrors as getBlindMirrorsApi } from '../api/getBlindMirrors'
import { removeBlindMirror as removeBlindMirrorApi } from '../api/removeBlindMirror'

export const removeBlindMirror = createAsyncThunk(
  'blindMirrors/removeBlindMirror',
  async (key) => {
    await removeBlindMirrorApi(key)
    return getBlindMirrorsApi()
  }
)
