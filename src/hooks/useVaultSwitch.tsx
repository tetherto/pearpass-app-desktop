import React, { useCallback } from 'react'

import { useVault, type Vault } from '@tetherto/pearpass-lib-vault'

import { VaultPasswordFormModalContent } from '../containers/Modal/VaultPasswordFormModalContent'
import { useLoadingContext } from '../context/LoadingContext'
import { useModal } from '../context/ModalContext'
import { setLastOpenedVaultId } from '../utils/lastOpenedVaultStorage'
import { logger } from '../utils/logger'
/**
 * Switch active vault with the same flow everywhere: optional password modal
 * when the vault is protected, then {@link refetch} and an optional success callback.
 */
export function useVaultSwitch() {
  const { setIsLoading } = useLoadingContext()
  const { setModal, closeModal } = useModal()
  const {
    data: activeVault,
    isVaultProtected,
    refetch: refetchVault
  } = useVault()

  const switchVault = useCallback(
    async (
      vault: Vault,
      onSuccess: () => void | Promise<void> = async () => {}
    ) => {
      setIsLoading(true)

      try {
        if (vault.id === activeVault?.id) {
          await onSuccess()
          return
        }

        const isProtected = await isVaultProtected(vault.id)

        if (isProtected) {
          setModal(
            <VaultPasswordFormModalContent
              vault={vault}
              onSubmit={async (password: string) => {
                setIsLoading(true)
                try {
                  await refetchVault(vault.id, { password })
                  setLastOpenedVaultId(vault.id)
                  closeModal()
                  await onSuccess()
                } finally {
                  setIsLoading(false)
                }
              }}
            />
          )
          return
        }

        await refetchVault(vault.id)
        setLastOpenedVaultId(vault.id)
        await onSuccess()
      } catch (error) {
        logger.error('useVaultSwitch', 'Error switching to vault:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [activeVault?.id, closeModal, isVaultProtected, setIsLoading, setModal]
  )

  return { switchVault }
}
