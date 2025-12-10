import { useDispatch, useSelector } from 'react-redux'

import { createRecord as createRecordAction } from '../actions/createRecord'
import { selectVault } from '../selectors/selectVault'
import { handleErrorIfExists } from '../utils/handleError'

/**
 * @param {{
 *  onCompleted?: (payload: {record: any}) => void
 *  onError?: (error: Error) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  createRecord: (record: any) => Promise<void>
 * }}
 */
export const useCreateRecord = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const { isRecordLoading: isLoading } = useSelector(selectVault)

  const createRecord = async (record, onError) => {
    const { error, payload } = await dispatch(createRecordAction(record))
    handleErrorIfExists(error, onError, 'Failed to create record')

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return { isLoading, createRecord }
}
