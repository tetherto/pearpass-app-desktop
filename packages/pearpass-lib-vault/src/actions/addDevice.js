import { createAsyncThunk } from '@reduxjs/toolkit'

import { addDevice as addDeviceApi } from '../api/addDevice'
import { addDeviceFactory } from '../utils/addDeviceFactory'

export const addDevice = createAsyncThunk(
  'vault/addDevice',
  async (payload, { getState }) => {
    const vaultId = getState().vault.data.id

    const newDevice = addDeviceFactory(payload, vaultId)

    await addDeviceApi(newDevice)

    return newDevice
  }
)
