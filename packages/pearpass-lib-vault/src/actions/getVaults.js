import { createAsyncThunk } from '@reduxjs/toolkit'

import { listVaults } from '../api/listVaults'

export const getVaults = createAsyncThunk('vaults/getVaults', listVaults)
