import React from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useFolders } from 'pearpass-lib-vault'

import { StarIcon } from '../../lib-react-components'
import { FAVORITES_FOLDER_ID } from '../../utils/isFavorite'
import { MenuDropdown } from '../MenuDropdown'

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

  const { i18n } = useLingui()

  const customFolders = React.useMemo(() => {
    const mappedFolders = Object.values(folders?.customFolders ?? {}).map(
      (folder) => ({ name: folder.name })
    )

    if (selectedFolder) {
      mappedFolders.unshift({ name: i18n._('No Folder'), type: NO_FOLDER })
    }

    return mappedFolders
  }, [folders])

  const isFavorite = selectedFolder === FAVORITES_FOLDER_ID
  const name = isFavorite ? i18n._('Favorite') : selectedFolder
  const icon = isFavorite ? StarIcon : undefined

  const handleFolderSelect = (folder) => {
    onFolderSelect(folder.type === NO_FOLDER ? undefined : folder)
  }

  return html`
    <${MenuDropdown}
      testId=${testId}
      selectedItem=${{ name, icon }}
      onItemSelect=${handleFolderSelect}
      items=${customFolders}
    />
  `
}
