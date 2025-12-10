import { createSelector } from '@reduxjs/toolkit'
import { matchPatternToValue } from 'pear-apps-utils-pattern-search'

export const selectRecords = ({ filters, sort } = {}) =>
  createSelector(
    (state) => state.vault,
    (vault) => {
      const records =
        vault.data?.records?.filter((record) => {
          if (!record) {
            return false
          }
          if (
            (filters?.folder || filters?.folder === null) &&
            record.folder !== filters?.folder
          ) {
            return false
          }

          if (
            !!filters?.searchPattern?.length &&
            !!record?.data &&
            !matchPatternToValue(filters.searchPattern, record.data.title) &&
            !matchPatternToValue(filters.searchPattern, record.folder)
          ) {
            return false
          }

          if (filters?.type && record.type !== filters.type) {
            return false
          }

          if (
            typeof filters?.isFavorite === 'boolean' &&
            !!record.isFavorite !== filters.isFavorite
          ) {
            return false
          }

          return filters?.isFolder === true || !!record.data
        }) ?? []

      const sortedRecords = [...records].sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
          if (sort?.key === 'updatedAt') {
            return sort?.direction === 'asc'
              ? a.updatedAt - b.updatedAt
              : b.updatedAt - a.updatedAt
          }
          if (sort?.key === 'createdAt') {
            return sort?.direction === 'asc'
              ? a.createdAt - b.createdAt
              : b.createdAt - a.createdAt
          }
        }

        return a.isFavorite ? -1 : 1
      })

      return {
        isLoading: vault.isLoading,
        data: sortedRecords
      }
    }
  )
