import { useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { createVault as createVaultAction } from '../actions/createVault'
import { selectVault } from '../selectors/selectVault'

/**
 * @returns {{
 *  isLoading: boolean
 *  createVault: ({name: string, password?: string}) => Promise<void>
 *  }}
 */
export const useCreateVault = () => {
  const dispatch = useDispatch()

  const [isCreateLoading, setIsCreateLoading] = useState(false)

  const { isLoading: isVaultLoading } = useSelector(selectVault)

  const createVault = async ({ name, password }) => {
    setIsCreateLoading(true)

    const { error, payload } = await dispatch(
      createVaultAction({ name, password })
    )

    setIsCreateLoading(false)

    if (error) {
      throw new Error('Failed to create vault')
    }

    return payload
  }

  return { isLoading: isCreateLoading || isVaultLoading, createVault }
}
