import { useDispatch, useSelector } from 'react-redux'

import { fetchMasterPasswordStatus } from '../actions/fetchMasterPasswordStatus'
import { initializeUser } from '../actions/initializeUser'
import { createMasterPassword as createMasterPasswordApi } from '../api/createMasterPassword'
import { init } from '../api/init'
import { updateMasterPassword as updateMasterPasswordApi } from '../api/updateMasterPassword'
import { selectUser } from '../selectors/selectUser'

/**
 * @returns {{
 *  isLoading: boolean
 *  isInitialized: boolean
 *  refetch: () => Promise<{
 *    hasPasswordSet: boolean
 *    isLoggedIn: boolean
 *    isVaultOpen: boolean
 *  }>
 *  data: {
 *    hasPasswordSet: boolean
 *    isLoggedIn: boolean
 *    isVaultOpen: boolean
 *  }
 *  hasPasswordSet: boolean
 *  masterPasswordStatus: {
 *    isLocked: boolean
 *    lockoutRemainingMs: number
 *    remainingAttempts: number
 *  }
 *  logIn: ({
 *    ciphertext?: string
 *    nonce?: string
 *    salt?: string
 *    hashedPassword?: string
 *    password?: string
 *  }) => Promise<void>
 *  createMasterPassword: (password: string) => Promise<{
 *   ciphertext: string
 *   nonce: string
 *   salt: string
 *   hashedPassword: string
 *    }>
 *  updateMasterPassword: ({
 *    newPassword: string
 *    currentPassword: string
 *  }) => Promise<{
 *    ciphertext: string
 *    nonce: string
 *    salt: string
 *    hashedPassword: string
 *  }>
 *  refetch: () => Promise<{
 *    hasPasswordSet: boolean
 *    isLoggedIn: boolean
 *    isVaultOpen: boolean
 *  }>
 *  refreshMasterPasswordStatus: () => Promise<{
 *    isLocked: boolean
 *    lockoutRemainingMs: number
 *    remainingAttempts: number
 *  }>
 *  }}
 */
export const useUserData = () => {
  const { isLoading, isInitialized, data: userData } = useSelector(selectUser)
  const dispatch = useDispatch()

  const logIn = async ({ ciphertext, nonce, salt, hashedPassword, password }) =>
    init({
      ciphertext,
      nonce,
      salt,
      hashedPassword,
      password
    })

  const createMasterPassword = async (password) => {
    const result = await createMasterPasswordApi(password)

    return result
  }

  const updateMasterPassword = async ({ newPassword, currentPassword }) => {
    const result = await updateMasterPasswordApi({
      newPassword,
      currentPassword
    })

    return result
  }

  const refetch = async () => {
    const { payload } = await dispatch(initializeUser())

    return payload
  }

  const refreshMasterPasswordStatus = async () => {
    const { payload } = await dispatch(fetchMasterPasswordStatus())
    return payload
  }

  return {
    data: userData,
    isInitialized: isInitialized,
    hasPasswordSet: userData.hasPasswordSet,
    masterPasswordStatus: userData.masterPasswordStatus,
    isLoading,
    logIn,
    createMasterPassword,
    updateMasterPassword,
    updateMasterPassword,
    refetch,
    refreshMasterPasswordStatus
  }
}
