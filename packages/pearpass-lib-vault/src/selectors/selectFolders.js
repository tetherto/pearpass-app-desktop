import { createSelector } from '@reduxjs/toolkit'

import { selectRecords } from './selectRecords'

export const selectFolders = (filters) =>
  createSelector(
    selectRecords({
      filters: {
        searchPattern: filters?.searchPattern,
        isFolder: true
      }
    }),
    ({ isLoading, data: records }) => ({
      isLoading,
      data: records?.reduce(
        (acc, record) => {
          const folder = record.folder

          if (record.isFavorite) {
            acc.favorites.records.push(record)
          }

          if (!folder) {
            acc.noFolder.records.push(record)
            return acc
          }

          if (!acc.customFolders[folder]) {
            acc.customFolders[folder] = {
              name: folder,
              records: []
            }
          }

          acc.customFolders[folder].records.push(record)
          return acc
        },
        {
          favorites: { records: [] },
          noFolder: { records: [] },
          customFolders: {}
        }
      )
    })
  )
