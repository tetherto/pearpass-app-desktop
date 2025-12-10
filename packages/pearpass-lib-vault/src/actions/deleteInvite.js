import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteInvite as deleteInviteApi } from '../api/deleteInvite'

export const deleteInvite = createAsyncThunk('vault/deleteInvite', async () => {
  await deleteInviteApi()

  return null
})
