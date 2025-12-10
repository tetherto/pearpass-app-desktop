import { createAsyncThunk } from '@reduxjs/toolkit'
import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'
import { Validator } from 'pear-apps-utils-validator'

import { createProtectedVault } from '../api/createProtectedVault'
import { createUnprotectedVault as createUnprotectedVaultApi } from '../api/createUnprotectedVault'
import { VERSION } from '../constants/version'

const schema = Validator.object({
  id: Validator.string().required(),
  name: Validator.string().required(),
  version: Validator.number().required(),
  records: Validator.array().required(),
  devices: Validator.array().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const createVault = createAsyncThunk(
  'vault/createVault',
  async ({ name, password }) => {
    const vault = {
      id: generateUniqueId(),
      name: name,
      version: VERSION.v1,
      records: [],
      devices: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const errors = schema.validate(vault)

    if (errors) {
      throw new Error(`Invalid vault data: ${JSON.stringify(errors, null, 2)}`)
    }

    if (password?.length) {
      await createProtectedVault(vault, password)
    } else {
      await createUnprotectedVaultApi(vault)
    }

    return vault
  }
)
