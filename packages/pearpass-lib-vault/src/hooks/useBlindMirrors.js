import { useDispatch, useSelector } from 'react-redux'

import { addBlindMirrors as addBlindMirrorsAction } from '../actions/addBlindMirrors'
import { addDefaultBlindMirrors as addDefaultBlindMirrorsAction } from '../actions/addDefaultBlindMirrors'
import { getBlindMirrors as getBlindMirrorsAction } from '../actions/getBlindMirrors'
import { removeAllBlindMirrors as removeAllBlindMirrorsAction } from '../actions/removeAllBlindMirrors'
import { removeBlindMirror as removeBlindMirrorAction } from '../actions/removeBlindMirror'
import {
  selectBlindMirrorsData,
  selectBlindMirrorsError,
  selectBlindMirrorsLoading
} from '../selectors/selectBlindMirrors'

/**
 * Hook to manage blind mirrors functionality
 * @returns {{
 *  isLoading: boolean,
 *  error: string | object | null,
 *  data: Array,
 *  addBlindMirrors: (blindMirrors: string[]) => Promise<any>,
 *  addDefaultBlindMirrors: () => Promise<any>,
 *  getBlindMirrors: () => Promise<any>,
 *  removeBlindMirror: (key: string) => Promise<any>,
 *  removeAllBlindMirrors: () => Promise<any>
 * }}
 */
export const useBlindMirrors = () => {
  const dispatch = useDispatch()

  const isLoading = useSelector(selectBlindMirrorsLoading)
  const error = useSelector(selectBlindMirrorsError)
  const data = useSelector(selectBlindMirrorsData)

  const addBlindMirrors = async (blindMirrors) => {
    if (isLoading) {
      return
    }
    if (!Array.isArray(blindMirrors) || blindMirrors.length === 0) {
      throw new Error('Invalid blind mirrors array')
    }

    const { error: actionError, payload } = await dispatch(
      addBlindMirrorsAction(blindMirrors)
    )

    if (actionError) {
      throw new Error(actionError.message || 'Failed to add blind mirrors')
    }

    return payload
  }

  const addDefaultBlindMirrors = async () => {
    if (isLoading) {
      return
    }
    const { error: actionError, payload } = await dispatch(
      addDefaultBlindMirrorsAction()
    )

    if (actionError) {
      throw new Error(
        actionError.message || 'Failed to add default blind mirrors'
      )
    }

    return payload
  }

  const getBlindMirrors = async () => {
    if (isLoading) {
      return
    }
    const { error: actionError, payload } = await dispatch(
      getBlindMirrorsAction()
    )

    if (actionError) {
      throw new Error(actionError.message || 'Failed to get blind mirrors')
    }

    return payload
  }

  const removeBlindMirror = async (key) => {
    if (isLoading) {
      return
    }
    if (!key) {
      throw new Error('Key is required')
    }

    const { error: actionError, payload } = await dispatch(
      removeBlindMirrorAction(key)
    )

    if (actionError) {
      throw new Error(actionError.message || 'Failed to remove blind mirror')
    }

    return payload
  }

  const removeAllBlindMirrors = async () => {
    if (isLoading) {
      return
    }
    const { error: actionError, payload } = await dispatch(
      removeAllBlindMirrorsAction()
    )

    if (actionError) {
      throw new Error(
        actionError.message || 'Failed to remove all blind mirrors'
      )
    }

    return payload
  }

  return {
    isLoading,
    error,
    data,
    addBlindMirrors,
    addDefaultBlindMirrors,
    getBlindMirrors,
    removeBlindMirror,
    removeAllBlindMirrors
  }
}
