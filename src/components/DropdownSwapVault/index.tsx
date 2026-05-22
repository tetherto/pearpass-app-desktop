import React, { useEffect, useState } from 'react'

import { html } from 'htm/react'
import { useVault, type Vault } from '@tetherto/pearpass-lib-vault'

import {
  HeaderContainer,
  CreateVaultButton,
  Dropdown,
  DropdownItem,
  DropdownItemLabel,
  HeaderLabel,
  HeaderLeft,
  HeaderRight,
  Wrapper
} from './styles'
import { CreateOrEditVaultModalContent } from '../../containers/Modal/CreateOrEditVaultModalContent/CreateOrEditVaultModalContent'
import { VaultPasswordFormModalContent } from '../../containers/Modal/VaultPasswordFormModalContent'
import { useModal } from '../../context/ModalContext'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { ExpandMore, LockFilled, LockOutlined } from '@tetherto/pearpass-lib-ui-kit/icons'
import { logger } from '../../utils/logger'

interface DropdownSwapVaultProps {
  vaults?: Vault[]
  selectedVault?: Vault
}

export const DropdownSwapVault = ({ vaults, selectedVault }: DropdownSwapVaultProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const [isOpen, setIsOpen] = useState(false)

  const { closeModal, setModal } = useModal()

  const { isVaultProtected, refetch: refetchVault } = useVault()

  const [protectedVaultById, setProtectedVaultById] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!isOpen || !vaults?.length) {
      return
    }

    let isCancelled = false

    const loadProtected = async () => {
      const results = await Promise.all(
        vaults.map(async (vault) => {
          try {
            const isProtected = await isVaultProtected(vault.id)
            return [vault.id, !!isProtected]
          } catch {
            return [vault.id, false]
          }
        })
      )

      if (isCancelled) {
        return
      }

      setProtectedVaultById(Object.fromEntries(results))
    }

    loadProtected()

    return () => {
      isCancelled = true
    }
  }, [isOpen, isVaultProtected, vaults])

  const handleVaultUnlock = async ({
    vault,
    password
  }: {
    vault: Vault
    password: string
  }) => {
    if (!vault.id) {
      return
    }

    try {
      await refetchVault(vault.id, { password })
      closeModal()
    } catch (error) {
      logger.error('DropdownSwapVault', error)

      throw error
    }
  }

  const onVaultSelect = async (vault: Vault) => {
    const cached = protectedVaultById[vault.id]
    const isProtected = cached ?? (await isVaultProtected(vault.id))

    if (cached === undefined) {
      setProtectedVaultById((prev) => ({ ...prev, [vault.id]: isProtected }))
    }

    if (isProtected) {
      setModal(
        html`<${VaultPasswordFormModalContent}
          onSubmit=${async (password: string) =>
            handleVaultUnlock({ vault, password })}
          vault=${vault}
        />`
      )
    } else {
      await refetchVault(vault.id)
    }

    setIsOpen(false)
  }

  const handleCreateNewVault = () => {
    setIsOpen(false)
    setModal(
      html`<${CreateOrEditVaultModalContent} onClose=${closeModal} onSuccess=${closeModal} />`
    )
  }

  if (!selectedVault?.id) {
    return null
  }

  return (
    <Wrapper>
      <HeaderContainer
        data-testid="dropdownswapvault-container"
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <HeaderLeft>
          <LockFilled width="24" height="24" fill={theme.colors.colorPrimary} />
          <HeaderLabel>{selectedVault?.name}</HeaderLabel>
        </HeaderLeft>

        <HeaderRight isOpen={isOpen}>
          <ExpandMore width="20" height="20" fill={theme.colors.colorPrimary} />
        </HeaderRight>
      </HeaderContainer>

      <Dropdown isOpen={isOpen}>
        {vaults?.map((vault, index) => (
          <DropdownItem
            data-testid={`dropdownswapvault-option-${vault.id}`}
            key={vault.id}
            isOpen={isOpen}
            delayMs={index * 30}
            onClick={() => onVaultSelect(vault)}
          >
            <DropdownItemLabel>{vault.name}</DropdownItemLabel>
            {protectedVaultById[vault.id] ? (
              <LockOutlined width="25" height="25" fill={theme.colors.colorSurfacePrimary} />
            ) : null}
          </DropdownItem>
        ))}

        <CreateVaultButton
          data-testid="dropdownswapvault-create"
          isOpen={isOpen}
          delayMs={(vaults?.length ?? 0) * 30}
          onClick={handleCreateNewVault}
        >
          {t('Create New Vault')}
        </CreateVaultButton>
      </Dropdown>
    </Wrapper>
  )
}
