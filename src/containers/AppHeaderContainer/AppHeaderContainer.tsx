import React from 'react'
import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import { ContextMenu, NavbarListItem, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import {
  AccountCircleOutlined,
  AssignmentInd,
  CreditCard,
  FormatQuote,
  GridView,
  Key,
  Note,
  QrCode,
  WiFi
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'

import {
  AppHeaderAddItemTrigger,
  AppHeader
} from '../../components/AppHeader'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { useAppHeaderContext } from '../../context/AppHeaderContext'
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'
import { useTranslation } from '../../hooks/useTranslation'
import { isFavorite } from '../../utils/isFavorite'
import { ImportItemOrVaultModalContent } from '../Modal/ImportItemOrVaultModalContent'

export const AppHeaderContainer = () => {
  const { currentPage, data: routerData } = useRouter()
  const { setModal } = useModal()
  const {
    searchValue,
    setSearchValue,
    isAddMenuOpen,
    setIsAddMenuOpen
  } = useAppHeaderContext()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const { theme } = useTheme()
  const { t } = useTranslation()

  if (currentPage !== 'vault') {
    return null
  }

  const isFavoritesView = isFavorite(routerData?.folder ?? '')
  const selectedFolder =
    routerData?.folder && !isFavoritesView ? routerData.folder : undefined

  const iconColor = theme.colors.colorTextPrimary

  const addItems = [
    { type: RECORD_TYPES.LOGIN,         label: t('Logins'),            icon: <AccountCircleOutlined color={iconColor} /> },
    { type: RECORD_TYPES.CREDIT_CARD,   label: t('Credit Card'),       icon: <CreditCard color={iconColor} /> },
    { type: RECORD_TYPES.IDENTITY,      label: t('Identities'),        icon: <AssignmentInd color={iconColor} /> },
    { type: RECORD_TYPES.NOTE,          label: t('Notes'),             icon: <Note color={iconColor} /> },
    { type: RECORD_TYPES.PASS_PHRASE,   label: t('Recovery Phrases'),  icon: <FormatQuote color={iconColor} /> },
    { type: RECORD_TYPES.WIFI_PASSWORD, label: t('Wi-Fi'),             icon: <WiFi color={iconColor} /> },
    { type: 'password',                 label: t('Password'),          icon: <Key color={iconColor} /> },
    { type: RECORD_TYPES.CUSTOM,        label: t('Other'),             icon: <GridView color={iconColor} /> },
    ...(AUTHENTICATOR_ENABLED
      ? [{ type: RECORD_TYPES.OTP, label: t('Authenticator Code'), icon: <QrCode color={iconColor} /> }]
      : [])
  ]

  const handleImportClick = () => {
    setModal(<ImportItemOrVaultModalContent />)
  }

  const addItemControl = (
    <ContextMenu
      trigger={<AppHeaderAddItemTrigger testId="main-plus-button" />}
      open={isAddMenuOpen}
      onOpenChange={setIsAddMenuOpen}
      testID="add-item-menu"
    >
      {addItems.map(item => (
        <NavbarListItem
          key={item.type}
          size="small"
          icon={item.icon}
          label={item.label}
          testID={`add-item-${item.type}`}
          onClick={() => {
            handleCreateOrEditRecord({
              recordType: item.type,
              selectedFolder,
              isFavorite: isFavoritesView ? true : undefined
            })
            setIsAddMenuOpen(false)
          }}
        />
      ))}
    </ContextMenu>
  )

  return (
    <AppHeader
      searchValue={searchValue}
      onSearchChange={(val) => setSearchValue(val)}
      onImportClick={handleImportClick}
      addItemControl={addItemControl}
    />
  )
}
