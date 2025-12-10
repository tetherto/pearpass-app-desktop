import { createAsyncThunk } from '@reduxjs/toolkit'

import { createRecord as createRecordApi } from '../api/createRecord'
import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'
import { updateRecords as updateRecordsApi } from '../api/updateRecords'
import { selectFolders } from '../selectors/selectFolders'
import { createFolderFactory } from '../utils/createFolderFactory'
import { updateFolderFactory } from '../utils/updateFolderFactory'

export const renameFolder = createAsyncThunk(
  'vault/renameFolder',
  async ({ name, newName }, { getState }) => {
    const state = getState()

    if (!name) {
      throw new Error('Selected folder is required')
    }

    if (name === newName) {
      throw new Error('New name must be different from the old name')
    }

    const { data } = selectFolders()(state)

    const selectedFolder = data.customFolders[name]

    const record = createFolderFactory(newName, state.vault.data.id)

    await createRecordApi(record)

    const recordIds = selectedFolder.records.reduce(
      (recordIds, record) => {
        if (record.data) {
          recordIds.toRename.push(record.id)
        } else {
          recordIds.toDelete.push(record.id)
        }
        return recordIds
      },
      {
        toRename: [],
        toDelete: []
      }
    )

    const records =
      updateFolderFactory(recordIds.toRename, newName, state.vault) || []

    if (records.length) {
      await updateRecordsApi(records)
    }

    await deleteRecordsApi(recordIds.toDelete)

    return listRecords()
  }
)
