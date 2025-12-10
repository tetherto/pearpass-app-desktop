import { useDispatch, useSelector } from 'react-redux'

import { createInvite as createInviteAction } from '../actions/createInvite'
import { deleteInvite as deleteInviteAction } from '../actions/deleteInvite'
import { selectInvite } from '../selectors/selectInvite'

/**
 * @returns {{
 *  isLoading: boolean
 *  data: any
 *  createInvite: () => Promise<void>
 *  deleteInvite: () => Promise<void>
 * }}
 */
export const useInvite = () => {
  const dispatch = useDispatch()
  const { isLoading, data } = useSelector(selectInvite)

  const handleAction = async (action) => dispatch(action())

  return {
    isLoading,
    data,
    createInvite: () => handleAction(createInviteAction),
    deleteInvite: () => handleAction(deleteInviteAction)
  }
}
