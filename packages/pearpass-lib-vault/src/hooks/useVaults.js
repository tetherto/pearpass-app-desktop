import { useDispatch, useSelector } from 'react-redux'

import { getVaults } from '../actions/getVaults'
import { initializeVaults } from '../actions/initializeVaults'
import { resetState as resetStateAction } from '../actions/resetState'
import { selectVaults } from '../selectors/selectVaults'

/**
 *  @param {{
 *    onCompleted?: (payload: any) => void
 *    onInitialize?: (payload: any) => void
 *  }} options
 *   @returns {{
 *    isLoading: boolean
 *    isInitialized: boolean
 *    data: any
 *    refetch: () => Promise<any>
 *    initVaults: ({
 *      ciphertext?: string
 *      nonce?: string
 *      salt?: string
 *      hashedPassword?: string
 *      password?: string
 *    }) => Promise<void>
 *    resetState: () => void
 *  }}
 */
export const useVaults = ({ onCompleted, onInitialize } = {}) => {
  const dispatch = useDispatch()

  const { isLoading, data, isInitialized, isInitializing } =
    useSelector(selectVaults)

  const initVaults = async ({
    ciphertext,
    nonce,
    salt,
    hashedPassword,
    password
  }) => {
    if (isInitialized || isInitializing) {
      return
    }

    const { payload: vaults, error } = await dispatch(
      initializeVaults({
        ciphertext,
        nonce,
        salt,
        hashedPassword,
        password
      })
    )

    if (error) {
      throw new Error('Failed to initialize vaults')
    }

    onInitialize?.(vaults)
  }

  const fetchVaults = async () => {
    const { payload: vaults } = await dispatch(getVaults())

    onCompleted?.(vaults)

    return vaults
  }

  const refetch = async () => {
    const vaults = await fetchVaults()

    return vaults
  }

  const resetState = () => {
    dispatch(resetStateAction())
  }

  return { isLoading, isInitialized, data, refetch, initVaults, resetState }
}
