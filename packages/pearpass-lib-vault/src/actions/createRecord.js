import { createAsyncThunk } from '@reduxjs/toolkit'

import { vaultAddFiles as addFilesApi } from '../api/addFiles.js'
import { createRecord as createRecordApi } from '../api/createRecord'
import { RECORD_TYPES } from '../constants/recordTypes'
import { createRecordFactory } from '../utils/createRecordFactory'
import { validateAndPrepareBuffersFromRecord } from '../utils/validateAndPrepareBuffersFromRecord.js'

export const createRecord = createAsyncThunk(
  'vault/createRecord',
  async (payload, { getState }) => {
    const vaultId = getState().vault.data.id

    const { recordWithoutBuffers, buffersWithId } =
      validateAndPrepareBuffersFromRecord(payload)

    if (payload.type === RECORD_TYPES.LOGIN) {
      recordWithoutBuffers.data.passwordUpdatedAt =
        recordWithoutBuffers.data.passwordUpdatedAt ?? Date.now()
    }

    const newRecord = createRecordFactory(recordWithoutBuffers, vaultId)

    if (buffersWithId.length) {
      await addFilesApi(
        buffersWithId.map(({ id, buffer, name }) => ({
          recordId: newRecord.id,
          fileId: id,
          buffer,
          name
        }))
      )
    }
    await createRecordApi(newRecord)

    return newRecord
  }
)
