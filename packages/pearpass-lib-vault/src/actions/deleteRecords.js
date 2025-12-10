import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'
import { vaultRemoveFiles } from '../api/removeFiles'
import { extractFileIdsFromRecord } from '../utils/extractFileIdsFromRecord'

export const deleteRecords = createAsyncThunk(
  'vault/deleteRecords',
  async (recordIds) => {
    if (!recordIds.length) {
      throw new Error('Record ID is required')
    }

    const currentRecords = await listRecords()

    const fileKeysToDelete = recordIds.reduce((acc, recordId) => {
      const record = currentRecords.find((r) => r.id === recordId)
      const fileIds = extractFileIdsFromRecord(record)

      const fileKeys = fileIds.map((fileId) => ({ recordId, fileId }))

      return acc.concat(fileKeys)
    }, [])

    if (fileKeysToDelete.length) {
      await vaultRemoveFiles(fileKeysToDelete)
    }

    await deleteRecordsApi(recordIds)

    return listRecords()
  }
)
