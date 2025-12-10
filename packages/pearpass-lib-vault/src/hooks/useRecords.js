import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { deleteRecords as deleteRecordsAction } from '../actions/deleteRecords'
import { getVaultById } from '../actions/getVaultById'
import {
  updateFavoriteState as updateFavoriteStateAction,
  updateFolder as updateFolderAction,
  updateRecords as updateRecordsAction
} from '../actions/updateRecords'
import { selectRecords } from '../selectors/selectRecords'
import { selectVault } from '../selectors/selectVault'
import { handleErrorIfExists } from '../utils/handleError'

/**
 * @param {{
 *  onCompleted?: (payload: any) => void
 *  shouldSkip?: boolean
 *  variables: {
 *    vaultId: string
 *    filters: {
 *        searchPattern: string
 *        type: string
 *        folder: string
 *        isFavorite: boolean
 *    }
 *    sort: {
 *      field: string
 *       direction: 'asc' | 'desc'
 *    }
 * }
 * }} options
 * @returns {{
 *    isLoading: boolean
 *    isInitialized: boolean
 *    deleteRecords: (recordIds: Array<string>) => Promise<void>
 *    updateRecords: (records: Array<Object>) => Promise<void>
 *    updateFolder: (recordIds: Array<string>, folder: string) => Promise<void>
 *    updateFavoriteState: (recordIds: Array<string>, isFavorite: boolean) => Promise<void>
 *    data: Object
 *   refetch: (vaultId: string) => Promise<void>
 * }}
 */
export const useRecords = ({ onCompleted, shouldSkip, variables } = {}) => {
  const dispatch = useDispatch()

  const { data: vaultData, isInitialized: isVaultInitialized } =
    useSelector(selectVault)

  const providedVaultId = variables?.vaultId || vaultData?.id

  const { isLoading, data } = useSelector(
    selectRecords({
      filters: {
        searchPattern: variables?.filters?.searchPattern,
        type: variables?.filters?.type,
        folder: variables?.filters?.folder,
        isFavorite: variables?.filters?.isFavorite
      },
      sort: variables?.sort
    })
  )

  const fetchVault = async (vaultId) => {
    const { payload, error } = await dispatch(getVaultById({ vaultId }))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const refetch = (vaultId) => {
    fetchVault(vaultId || providedVaultId)
  }

  const updateRecords = async (records, onError) => {
    const { error, payload } = await dispatch(updateRecordsAction(records))
    handleErrorIfExists(error, onError, 'Failed to update records')

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const updateFolder = async (recordIds, folder) => {
    const { error, payload } = await dispatch(
      updateFolderAction(recordIds, folder)
    )

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const updateFavoriteState = async (recordIds, isFavorite) => {
    const { error, payload } = await dispatch(
      updateFavoriteStateAction(recordIds, isFavorite)
    )

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const deleteRecords = async (recordIds) => {
    const { error, payload } = await dispatch(deleteRecordsAction(recordIds))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  useEffect(() => {
    if (data || shouldSkip) {
      return
    }

    fetchVault(providedVaultId)
  }, [data, providedVaultId])

  return {
    isLoading,
    isInitialized: isVaultInitialized,
    data,
    refetch,
    updateRecords,
    updateFolder,
    updateFavoriteState,
    deleteRecords
  }
}
