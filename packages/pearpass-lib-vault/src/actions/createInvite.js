import { createAsyncThunk } from '@reduxjs/toolkit'
import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'
import { Validator } from 'pear-apps-utils-validator'

import { createInvite as createInviteApi } from '../api/createInvite'
import { VERSION } from '../constants/version'

export const inviteSchema = Validator.object({
  id: Validator.string().required(),
  version: Validator.number().required(),
  vaultId: Validator.string().required(),
  publicKey: Validator.string().required(),
  createdAt: Validator.number().required(),
  expiresAt: Validator.number().required()
})

export const createInvite = createAsyncThunk(
  'vault/createInvite',
  async (_, { getState }) => {
    const vaultId = getState().vault.data.id

    const publicKey = await createInviteApi()

    if (!publicKey) {
      throw new Error('Failed to create invite')
    }

    const invite = {
      id: generateUniqueId(),
      version: VERSION.v1,
      vaultId: vaultId,
      publicKey: publicKey,
      createdAt: Date.now(),
      expiresAt: Date.now()
    }

    const errors = inviteSchema.validate(invite)

    if (errors) {
      throw new Error(`Invalid invite data: ${JSON.stringify(errors, null, 2)}`)
    }

    return invite
  }
)
