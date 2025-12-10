import { createAsyncThunk } from '@reduxjs/toolkit'
import { Validator } from 'pear-apps-utils-validator'

import { getVaultByIdAndClose } from '../api/getVaultByIdAndClose'
import { updateProtectedVault as updateProtectedVaultApi } from '../api/updateProtectedVault'

const schema = Validator.object({
  id: Validator.string().required(),
  name: Validator.string().required(),
  version: Validator.number().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const updateProtectedVault = createAsyncThunk(
  'vault/updateProtectedVault',
  async ({ vaultId, name, currentPassword, newPassword }) => {
    const vault = await getVaultByIdAndClose(vaultId, {
      password: currentPassword
    })

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

    await updateProtectedVaultApi({
      vault: newVault,
      currentPassword,
      newPassword
    })
  }
)
