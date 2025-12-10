import { createAsyncThunk } from '@reduxjs/toolkit'

import { pearpassVaultClient } from '../instances'

export const fetchMasterPasswordStatus = createAsyncThunk(
  'user/fetchMasterPasswordStatus',
  async () => pearpassVaultClient.getMasterPasswordStatus()
)
