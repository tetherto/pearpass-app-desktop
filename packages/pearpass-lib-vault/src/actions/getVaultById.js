import { createAsyncThunk } from '@reduxjs/toolkit'

import { getVaultById as getVaultByIdApi } from '../api/getVaultById'
import { listDevices } from '../api/listDevices'
import { listRecords } from '../api/listRecords'

export const getVaultById = createAsyncThunk(
  'vault/getVault',
  async ({ vaultId, params } = {}) => {
    if (!vaultId) {
      throw new Error('Vault ID is required')
    }

    const vault = await getVaultByIdApi(vaultId, params)

    if (!vault) {
      throw new Error('Vault not found ' + vaultId)
    }

    const records = (await listRecords(vault.id)) ?? []
    const devices = (await listDevices(vault.id)) ?? []

    return {
      ...vault,
      records: records ?? [],
      devices: devices ?? []
    }
  }
)
