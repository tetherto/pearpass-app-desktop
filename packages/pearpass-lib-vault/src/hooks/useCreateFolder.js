import { useDispatch, useSelector } from 'react-redux'

import { createFolder as createFolderAction } from '../actions/createFolder'
import { selectFolders } from '../selectors/selectFolders'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *  onCompleted?: (payload: {name: string}) => void
 *  onError?: (error: string) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  createFolder: (folderName: string) => void
 * }}
 */
export const useCreateFolder = ({ onCompleted, onError } = {}) => {
  const dispatch = useDispatch()

  const { isFolderLoading: isLoading } = useSelector(selectVault)

  const { data: foldersData } = useSelector(selectFolders)

  const createFolder = async (folderName) => {
    if (!folderName) {
      onError?.('folder_name_required')
      return
    }

    if (foldersData?.customFolders[folderName]) {
      onError?.('folder_name_exists')
      return
    }

    const { error, payload } = await dispatch(createFolderAction(folderName))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return { isLoading, createFolder }
}
