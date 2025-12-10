import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecords as deleteRecordsAction } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'
import { selectFolders } from '../selectors/selectFolders'

export const deleteFolder = createAsyncThunk(
  'vault/deleteFolder',
  async (folderName, { getState }) => {
    if (!folderName) {
      throw new Error('Selected folder is required')
    }
    const { data } = selectFolders()(getState())

    const selectedFolder = data.customFolders[folderName]

    const recordIdsToDelete = selectedFolder.records.map((record) => record.id)

    await deleteRecordsAction(recordIdsToDelete)

    return listRecords()
  }
)
