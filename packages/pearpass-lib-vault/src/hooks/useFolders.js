import { useDispatch, useSelector } from 'react-redux'

import { deleteFolder as deleteFolderAction } from '../actions/deleteFolder'
import { renameFolder as renameFolderAction } from '../actions/renameFolder'
import { selectFolders } from '../selectors/selectFolders'

/**
 * @param {{
 *  variables?: {
 *    searchPattern?: string
 *  }
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  data: any[]
 *  renameFolder: (name : string, newName: string) => Promise<void>
 *  deleteFolder: (name: string) => Promise<void>
 *  }}
 */
export const useFolders = ({ variables } = {}) => {
  const dispatch = useDispatch()

  const { isLoading, data } = useSelector(
    selectFolders({
      searchPattern: variables?.searchPattern
    })
  )

  const renameFolder = async (name, newName) => {
    await dispatch(renameFolderAction({ name, newName }))
  }

  const deleteFolder = async (name) => {
    await dispatch(deleteFolderAction(name))
  }

  return { isLoading, data, renameFolder, deleteFolder }
}
