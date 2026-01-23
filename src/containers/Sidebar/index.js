import React, { useEffect, useMemo, useState } from 'react'

import { html } from 'htm/react'
import { matchPatternToValue } from 'pear-apps-utils-pattern-search'
import {
  closeAllInstances,
  useFolders,
  useVault,
  useVaults
} from 'pearpass-lib-vault'

import { SideBarCategories } from './SidebarCategories'
import {
  FoldersWrapper,
  LogoWrapper,
  PearPass,
  SettingsContainer,
  SettingsSeparator,
  sideBarContent,
  SidebarNestedFoldersContainer,
  SidebarSettings,
  SidebarWrapper
} from './styles'
import { DropdownSwapVault } from '../../components/DropdownSwapVault'
import { SidebarFolder } from '../../components/SidebarFolder'
import { SidebarSearch } from '../../components/SidebarSearch'
import { NAVIGATION_ROUTES } from '../../constants/navigation'
import { useLoadingContext } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { useTranslation } from '../../hooks/useTranslation.js'
import {
  ButtonThin,
  ExitIcon,
  SettingsIcon,
  StarIcon,
  UserSecurityIcon
} from '../../lib-react-components'
import { LogoLock } from '../../svgs/LogoLock'
import { FAVORITES_FOLDER_ID } from '../../utils/isFavorite'
import { sortByName } from '../../utils/sortByName'
import { AddDeviceModalContent } from '../Modal/AddDeviceModalContent'
import { CreateFolderModalContent } from '../Modal/CreateFolderModalContent'

/**
 * @param {{
 *    sidebarSize?: 'default' | 'tight'
 * }} props
 */
export const Sidebar = ({ sidebarSize = 'tight' }) => {
  const { t } = useTranslation()
  const { navigate, data: routerData } = useRouter()

  const [searchValue, setSearchValue] = useState('')

  const { setIsLoading } = useLoadingContext()

  const { data, isLoading } = useFolders()

  const {
    data: vaultsData,
    resetState,
    refetch: refetchMasterVault
  } = useVaults()

  const { data: vaultData } = useVault()

  const vaults = useMemo(
    () => sortByName(vaultsData?.filter((vault) => vault.id !== vaultData?.id)),
    [vaultsData, vaultData]
  )

  const handleSettingsClick = () => {
    navigate('settings', {})
  }

  const openMainView = () => {
    navigate('vault', { recordType: 'all' })
  }

  const handleExitVault = async () => {
    setIsLoading(true)
    await closeAllInstances()
    navigate('welcome', { state: NAVIGATION_ROUTES.MASTER_PASSWORD })
    resetState()
    setIsLoading(false)
  }

  const folders = React.useMemo(() => {
    const { customFolders } = data || {}

    const otherFolders = Object.values(customFolders ?? {})
      .map(({ name }) => ({
        name,
        id: name,
        isActive: routerData?.folder === name
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const filteredFolders = searchValue
      ? otherFolders.filter((folder) =>
          matchPatternToValue(searchValue, folder.name)
        )
      : otherFolders

    const allItemsFolder = {
      name: t('All Items'),
      id: 'allItems',
      isRoot: true,
      isActive: !routerData?.folder && routerData?.recordType === 'all'
    }

    const favoritesFolder = {
      name: t('Favorites'),
      id: FAVORITES_FOLDER_ID,
      icon: StarIcon,
      isActive: routerData?.folder === FAVORITES_FOLDER_ID
    }

    return [allItemsFolder, favoritesFolder, ...filteredFolders]
  }, [data, t, routerData, searchValue])

  const { setModal } = useModal()

  const handleAddDevice = () => {
    setModal(html`<${AddDeviceModalContent} />`)
  }

  const handleAddFolderClick = () => {
    setModal(html`<${CreateFolderModalContent} />`)
  }

  const handleFolderClick = (id) => {
    if (id === 'allItems') {
      navigate('vault', { recordType: 'all' })
      return
    }

    navigate('vault', { recordType: 'all', folder: id })
  }

  useEffect(() => {
    refetchMasterVault()
  }, [])

  return html`
    <${SidebarWrapper} size=${sidebarSize}>
      <${LogoWrapper} onClick=${openMainView}>
        <${LogoLock} width="20" height="26" />
        <${PearPass}>PearPass<//>
      <//>

      <${sideBarContent}>
        <${DropdownSwapVault} vaults=${vaults} selectedVault=${vaultData} />

        <${SideBarCategories} sidebarSize=${sidebarSize} />

        ${!isLoading &&
        html`
          <${SidebarNestedFoldersContainer}>
            <${SidebarSearch}
              testId="sidebar-folder-search"
              value=${searchValue}
              onChange=${setSearchValue}
            />

            <${FoldersWrapper}>
              ${folders.map(({ id, isRoot, name, icon, isActive }) => {
                const hasMenu = id !== FAVORITES_FOLDER_ID && !isRoot

                return html`<${SidebarFolder}
                  key=${id}
                  isOpen=${false}
                  onClick=${() => handleFolderClick(id)}
                  onAddClick=${handleAddFolderClick}
                  isRoot=${isRoot}
                  name=${name}
                  icon=${icon}
                  isActive=${isActive}
                  hasMenu=${hasMenu}
                />`
              })}
            <//>
          <//>
        `}
      <//>

      <${SidebarSettings}>
        <${SettingsContainer}
          data-testid="sidebar-settings-button"
          onClick=${handleSettingsClick}
        >
          <${SettingsIcon} size="24" />
          ${t('Settings')}
        <//>

        <${SettingsSeparator} />

        <${ButtonThin}
          testId="sidebar-adddevice-button"
          startIcon=${UserSecurityIcon}
          onClick=${handleAddDevice}
        >
          ${t('Add a Device')}
        <//>

        <${ButtonThin}
          testId="sidebar-exit-button"
          startIcon=${ExitIcon}
          onClick=${handleExitVault}
        >
          ${t('Exit Vault')}
        <//>
      <//>
    <//>
  `
}
