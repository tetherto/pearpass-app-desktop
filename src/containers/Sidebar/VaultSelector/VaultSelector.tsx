import React, { useMemo, useState } from 'react'

import { UNSUPPORTED } from '@tetherto/pearpass-lib-constants'
import {
  useInvite,
  useVault,
  useVaults,
  type Vault
} from '@tetherto/pearpass-lib-vault'
import {
  Button,
  ContextMenu,
  ListItem,
  NavbarListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Add,
  Devices,
  EditOutlined,
  Key,
  LockFilled,
  MoreVert,
  PersonAddAlt,
  Share,
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles, VAULT_ACTIONS_MENU_WIDTH } from './VaultSelector.styles'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { sortByName } from '../../../utils/sortByName'
import { AddDeviceModalContentV2 } from '../../Modal/AddDeviceModalContentV2/AddDeviceModalContentV2'
import { CreateOrEditVaultModalContentV2 } from '../../Modal/CreateOrEditVaultModalContentV2/CreateOrEditVaultModalContentV2'
import { DeleteVaultModalContent } from '../../Modal/DeleteVaultModalContent'
import { ModifyVaultModalContent } from '../../Modal/ModifyVaultModalContent'
import { PairedDevicesModalContent } from '../../Modal/PairedDevicesModalContent'
import { useVaultSwitch } from '../../../hooks/useVaultSwitch'

type VaultSelectorProps = {
  onClose?: () => void
}

export const VaultSelector = ({ onClose }: VaultSelectorProps = {}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setIsLoading } = useLoadingContext()
  const { setModal, closeModal } = useModal()
  const { switchVault } = useVaultSwitch()

  const { data: vaultsData } = useVaults()
  const { data: activeVault } = useVault()
  const { data: inviteData, createInvite } = useInvite()

  const vaults = useMemo<Vault[]>(
    () => sortByName(vaultsData ?? []),
    [vaultsData]
  )

  const iconPrimary = { color: theme.colors.colorTextPrimary }
  const iconSecondary = { color: theme.colors.colorTextSecondary }
  const iconDestructive = {
    color: theme.colors.colorSurfaceDestructiveElevated
  }

  const openInviteModal = async (vault: Vault) => {
    if (inviteData?.vaultId !== vault.id) {
      setIsLoading(true)
      try {
        await createInvite()
      } finally {
        setIsLoading(false)
      }
    }
    setModal(<AddDeviceModalContentV2 />)
  }

  const handleCreate = () => {
    setModal(
      <CreateOrEditVaultModalContentV2
        onClose={closeModal}
        onSuccess={() => {
          closeModal()
          onClose?.()
        }}
      />
    )
  }

  const handleVaultClick = (vault: Vault) => {
    if (activeVault?.id !== vault.id) {
      void switchVault(vault)
    }
    onClose?.()
  }

  const handleInvite = (vault: Vault) => {
    openInviteModal(vault)
  }

  const handleRename = (vault: Vault) => {
    setModal(
      <CreateOrEditVaultModalContentV2
        vault={vault}
        onClose={closeModal}
        onSuccess={closeModal}
      />
    )
  }

  const handleSetPassword = (vault: Vault) => {
    void switchVault(vault, () => {
      setModal(
        <ModifyVaultModalContent vaultId={vault.id} vaultName={vault.name} />
      )
    })
  }

  const handleDelete = (vault: Vault) => {
    setModal(<DeleteVaultModalContent vaultId={vault.id} />)
  }

  const handleViewDevices = () => {
    setModal(<PairedDevicesModalContent />)
  }

  return (
    <div style={styles.wrapper} data-testid="vault-selector">
      <div style={styles.titleRow}>
        <div style={styles.titleLabel}>
          <Text
            variant="labelEmphasized"
            color={theme.colors.colorTextSecondary}
          >
            {t('Vaults')}
          </Text>
        </div>
        <Button
          variant="tertiary"
          size="small"
          data-testid="vault-selector-create"
          aria-label={t('Create new vault')}
          onClick={handleCreate}
          iconBefore={<Add style={iconSecondary} />}
        />
      </div>

      <div style={styles.list}>
        {vaults.map((vault) => (
          <VaultRow
            key={vault.id}
            vault={vault}
            isActive={vault.id === activeVault?.id}
            iconPrimary={iconPrimary}
            iconDestructive={iconDestructive}
            styles={styles}
            onSelect={handleVaultClick}
            onInvite={handleInvite}
            onRename={handleRename}
            onViewDevices={handleViewDevices}
            onManageMembers={handleInvite}
            onSetPassword={handleSetPassword}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}

type VaultRowProps = {
  vault: Vault
  isActive: boolean
  iconPrimary: { color: string }
  iconDestructive: { color: string }
  styles: ReturnType<typeof createStyles>
  onSelect: (vault: Vault) => void
  onInvite: (vault: Vault) => void
  onRename: (vault: Vault) => void
  onViewDevices: () => void
  onManageMembers: (vault: Vault) => void
  onSetPassword: (vault: Vault) => void
  onDelete: (vault: Vault) => void
}

const VaultRow = ({
  vault,
  isActive,
  iconPrimary,
  iconDestructive,
  styles,
  onSelect,
  onInvite,
  onRename,
  onViewDevices,
  onManageMembers,
  onSetPassword,
  onDelete
}: VaultRowProps) => {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  const withMenuClose = (handler: (vault: Vault) => void) => () => {
    setMenuOpen(false)
    handler(vault)
  }

  const stopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  const actionButtonStyle = styles.iconActionButton as React.ComponentProps<
    typeof Button
  >['style']

  const rightElement = (
    <div
      style={styles.rowActions}
      onClick={stopPropagation}
      data-testid={`vault-row-actions-${vault.id}`}
    >
      <Button
        variant="tertiary"
        size="small"
        data-testid={`vault-row-invite-${vault.id}`}
        aria-label={t('Invite to vault')}
        onClick={() => onInvite(vault)}
        style={actionButtonStyle}
        iconBefore={
          <PersonAddAlt width={16} height={16} color={iconPrimary.color} />
        }
      />
      <ContextMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        menuWidth={VAULT_ACTIONS_MENU_WIDTH}
        testID={`vault-row-menu-${vault.id}`}
        trigger={
          <Button
            variant="tertiary"
            size="small"
            aria-label={t('Vault actions')}
            style={actionButtonStyle}
            iconBefore={
              <MoreVert width={16} height={16} color={iconPrimary.color} />
            }
          />
        }
      >
        <div style={styles.menuGroup}>
          <NavbarListItem
            size="small"
            icon={<EditOutlined color={iconPrimary.color} />}
            label={t('Rename')}
            testID={`vault-row-rename-${vault.id}`}
            onClick={withMenuClose(onRename)}
          />
          <NavbarListItem
            size="small"
            icon={<Devices width={16} height={16} color={iconPrimary.color} />}
            label={t('View Paired Devices')}
            testID={`vault-row-devices-${vault.id}`}
            onClick={() => {
              setMenuOpen(false)
              onViewDevices()
            }}
          />
          {UNSUPPORTED && (
            <>
              <NavbarListItem
                size="small"
                icon={<Share color={iconPrimary.color} />}
                label={t('Manage Members')}
                testID={`vault-row-members-${vault.id}`}
                onClick={withMenuClose(onManageMembers)}
              />
              <NavbarListItem
                size="small"
                icon={<Key color={iconPrimary.color} />}
                label={t('Set Vault Password')}
                testID={`vault-row-password-${vault.id}`}
                onClick={withMenuClose(onSetPassword)}
              />
            </>
          )}
        </div>
        {UNSUPPORTED && (
          <>
            <hr style={styles.menuDivider} />
            <div style={styles.menuGroup}>
              <NavbarListItem
                size="small"
                variant="destructive"
                icon={<TrashOutlined color={iconDestructive.color} />}
                label={t('Delete')}
                testID={`vault-row-delete-${vault.id}`}
                onClick={withMenuClose(onDelete)}
              />
            </div>
          </>
        )}
      </ContextMenu>
    </div>
  )

  return (
    <ListItem
      icon={<LockFilled color={iconPrimary.color} />}
      iconSize={16}
      title={vault.name}
      selected={isActive}
      style={styles.vaultRow as React.ComponentProps<typeof ListItem>['style']}
      testID={`vault-row-${vault.id}`}
      onClick={() => onSelect(vault)}
      rightElement={isActive ? rightElement : undefined}
    />
  )
}
