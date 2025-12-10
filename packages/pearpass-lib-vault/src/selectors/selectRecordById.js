import { createSelector } from '@reduxjs/toolkit'

export const selectRecordById = (id) =>
  createSelector(
    (state) => state.vault,
    (vault) => ({
      isLoading: vault.isRecordLoading,
      data: vault.data?.records?.find((record) => record?.id === id)
    })
  )
