import { createAsyncThunk } from '@reduxjs/toolkit'

import { init } from '../api/init'
import { listVaults } from '../api/listVaults'

export const initializeVaults = createAsyncThunk(
  'vaults/initializeVaults',
  async ({ ciphertext, nonce, salt, hashedPassword, password }) => {
    await init({
      ciphertext,
      nonce,
      salt,
      hashedPassword,
      password
    })

    return listVaults()
  }
)
