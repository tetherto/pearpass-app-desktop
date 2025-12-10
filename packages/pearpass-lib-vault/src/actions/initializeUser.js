import { createAsyncThunk } from '@reduxjs/toolkit'

import { getMasterPasswordEncryption } from '../api/getMasterPasswordEncryption'
import { pearpassVaultClient } from '../instances'

export const initializeUser = createAsyncThunk(
  'user/initializeUser',
  async () => {
    const [masterPasswordEncryption, vaultsStatusRes, activeVaultStatusRes] =
      await Promise.all([
        getMasterPasswordEncryption(),
        pearpassVaultClient.vaultsGetStatus(),
        pearpassVaultClient.activeVaultGetStatus()
      ])

    const masterPasswordStatus =
      await pearpassVaultClient.getMasterPasswordStatus()
    const { ciphertext, nonce, salt } = masterPasswordEncryption || {}

    return {
      hasPasswordSet: !!(ciphertext && nonce && salt),
      isLoggedIn: !!vaultsStatusRes?.status,
      isVaultOpen: !!(vaultsStatusRes?.status && activeVaultStatusRes?.status),
      masterPasswordStatus
    }
  }
)
