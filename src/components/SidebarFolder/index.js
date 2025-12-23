import React, { useState } from 'react'

import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  FolderIcon,
  KebabMenuIcon,
  PlusIcon
} from '../../lib-react-components'
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
 *  isActive: boolean,
 *  testId?: string
 * }} props
 */
export const SidebarFolder = ({
  isOpen,
  onClick,
  onDropDown,
  onAddClick,
  isRoot,
  name,
  icon: Icon,
  isActive,
  testId
}) => {
  const [isNewPopupMenuOpen, setIsNewPopupMenuOpen] = useState(false)

  const handleDropDownClick = (e) => {
    e.stopPropagation()
    onDropDown()
  }

  return html`
    <${React.Fragment}>
      <${NestedFoldersContainer}>
        <${NestedItem} data-testid=${testId}>
          <div onClick=${handleDropDownClick}>
            <${isOpen ? ArrowDownIcon : ArrowUpIcon}
              ArrowUpIcon="14"
              color=${isActive ? colors.primary400.mode1 : undefined}
            />
          </div>

          <${NestedFolder} isActive=${isActive}>
            ${!isRoot &&
            html`
              <${Icon ?? FolderIcon}
                size="24"
                color=${isActive ? colors.primary400.mode1 : undefined}
              />
            `}

            <${FolderName} onClick=${onClick}>${name}<//>

            ${!isRoot &&
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
