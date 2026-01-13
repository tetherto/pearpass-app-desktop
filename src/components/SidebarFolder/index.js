import React, { useState } from 'react'

import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { FolderIcon, KebabMenuIcon, PlusIcon } from '../../lib-react-components'
import { EditFolderPopupContent } from '../EditFolderPopupContent'
import { PopupMenu } from '../PopupMenu'
import {
  AddIconWrapper,
  FolderName,
  NestedFolder,
  NestedFoldersContainer,
  NestedItem
} from './styles'

/**
 * @param {{
 *  isOpen: boolean
 *  onClick: () => void
 *  onAddClick: () => void
 *  isRoot: boolean
 *  name: string
 *  icon: string
 *  isActive: boolean
 *  hasMenu?: boolean
 * }} props
 */
export const SidebarFolder = ({
  onClick,
  onAddClick,
  isRoot,
  name,
  icon: Icon,
  isActive,
  hasMenu = true
}) => {
  const [isNewPopupMenuOpen, setIsNewPopupMenuOpen] = useState(false)

  return html`
    <${React.Fragment}>
      <${NestedFoldersContainer}>
        <${NestedItem}>
          <${NestedFolder}
            isActive=${isActive}
            data-testid="sidebar-folder"
            onClick=${onClick}
          >
            ${!isRoot &&
            html`
              <${Icon ?? FolderIcon}
                size="24"
                color=${isActive ? colors.primary400.mode1 : undefined}
              />
            `}

            <${FolderName}>${name}<//>

            ${!isRoot &&
            hasMenu &&
            html` <${PopupMenu}
              side="right"
              align="right"
              isOpen=${isNewPopupMenuOpen}
              setIsOpen=${setIsNewPopupMenuOpen}
              content=${html` <${EditFolderPopupContent} name=${name} /> `}
            >
              <${KebabMenuIcon} />
            <//>`}
          <//>
        <//>

        ${isRoot &&
        html`
          <${AddIconWrapper}
            data-testid="sidebarfolder-button-add"
            onClick=${() => onAddClick()}
          >
            <${PlusIcon} color=${colors.primary400.mode1} size="24" />
          <//>
        `}
      <//>
    <//>
  `
}
