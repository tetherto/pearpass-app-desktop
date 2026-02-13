import React, { useEffect } from 'react'

import { html } from 'htm/react'
import { useFolders } from 'pearpass-lib-vault'

import { CreateFolderModalContent } from '../../containers/Modal/CreateFolderModalContent'
import { useModal } from '../../context/ModalContext'
import { useTranslation } from '../../hooks/useTranslation'
import { PlusIcon, StarIcon } from '../../lib-react-components'
import { FAVORITES_FOLDER_ID } from '../../utils/isFavorite'
import { MenuDropdown } from '../MenuDropdown'
import { DropDownItem } from '../MenuDropdown/styles'

const NO_FOLDER = 'no-folder'

/**
 * @param {{
 *  selectedFolder?: {
 *    name: string;
 *    icon?: React.ReactNode;
 *  },
 *  onFolderSelect: (folder: {
 *    name: string;
 *    icon?: React.ReactNode;
 *   }) => void
 *  testId?: string
 * }} props
 */
export const FolderDropdown = ({ selectedFolder, onFolderSelect, testId }) => {
  const { data: folders } = useFolders()

  const { t } = useTranslation()
  const { setModal } = useModal()

  const customFolders = React.useMemo(() => {
    const mappedFolders = Object.values(folders?.customFolders ?? {}).map(
      (folder) => ({ name: folder.name })
    )

    if (selectedFolder) {
      mappedFolders.unshift({ name: t('No Folder'), type: NO_FOLDER })
    }

    return mappedFolders
  }, [folders])

  const isFavorite = selectedFolder === FAVORITES_FOLDER_ID
  const name = isFavorite ? t('Favorite') : selectedFolder
  const icon = isFavorite ? StarIcon : undefined

  const handleCreateNewFolder = () => {
    setModal(html`
      <${CreateFolderModalContent}
        onCreate=${(folderData) => onFolderSelect({ name: folderData?.folder })}
      />
    `)
  }

  const handleFolderSelect = (folder) => {
    onFolderSelect(folder.type === NO_FOLDER ? undefined : folder)
  }
  useEffect(() => {
    if (!selectedFolder) {
      return
    }

    const existingFolders = Object.values(folders?.customFolders ?? {})
    const exists = existingFolders.some(
      (folder) => folder.name === selectedFolder
    )

    if (!exists) {
      onFolderSelect(undefined)
    }
  }, [folders, onFolderSelect, selectedFolder])

  const CreteNewFolderComponent = html`
    <${DropDownItem}
      data-testid="menudropdown-create-new"
      onClick=${() => handleCreateNewFolder()}
    >
      <${PlusIcon} size="24" />
      ${t('Create new')}
    <//>
  `

  return html`
    <${MenuDropdown}
      testId=${testId}
      selectedItem=${{ name, icon }}
      onItemSelect=${handleFolderSelect}
      items=${customFolders}
      bottomComponent=${CreteNewFolderComponent}
    />
  `
}
