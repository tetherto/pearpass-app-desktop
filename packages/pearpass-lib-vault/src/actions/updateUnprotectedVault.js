import { createAsyncThunk } from '@reduxjs/toolkit'
import { Validator } from 'pear-apps-utils-validator'

import { getVaultByIdAndClose } from '../api/getVaultByIdAndClose'
import { updateUnprotectedVault as updateUnprotectedVaultApi } from '../api/updateUnprotectedVault'

const schema = Validator.object({
  id: Validator.string().required(),
  name: Validator.string().required(),
  version: Validator.number().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const updateUnprotectedVault = createAsyncThunk(
  'vault/updateUnprotectedVault',
  async ({ vaultId, name, newPassword }) => {
    const vault = await getVaultByIdAndClose(vaultId)

    const newVault = {
      ...vault,
      id: vaultId,
      name: name,
      updatedAt: Date.now()
    }

    const errors = schema.validate(newVault)

    if (errors) {
      throw new Error(`Invalid vault data: ${JSON.stringify(errors, null, 2)}`)
    }

    await updateUnprotectedVaultApi(newVault, newPassword)
  }
)
