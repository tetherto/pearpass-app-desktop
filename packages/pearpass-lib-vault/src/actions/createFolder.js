import { createAsyncThunk } from '@reduxjs/toolkit'

import { createRecord as createRecordApi } from '../api/createRecord'
import { createFolderFactory } from '../utils/createFolderFactory'

export const createFolder = createAsyncThunk(
  'vault/createFolder',
  async (folderName, { getState }) => {
    const vaultId = getState().vault.data.id

    const record = createFolderFactory(folderName, vaultId)

    await createRecordApi(record)

    return record
  }
)
