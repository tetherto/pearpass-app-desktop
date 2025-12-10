import { useState } from 'react'

import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { NestedFile, NestedFileContainer } from './styles'
import { CreateNewCategoryPopupContent } from '../../../components/CreateNewCategoryPopupContent'
import { PopupMenu } from '../../../components/PopupMenu'
import { useRouter } from '../../../context/RouterContext'
import { useCreateOrEditRecord } from '../../../hooks/useCreateOrEditRecord'
import { useRecordMenuItems } from '../../../hooks/useRecordMenuItems'

/**
 * @param {{
 *  icon: () => void,
 *  color: string,
 *  folderId: string,
 *  isNew: boolean,
 *  name: string
 *  id: string,
 *  level?: number
 * }} props
 */
export const SidebarNestedFile = ({
  icon,
  name,
  folderId,
  color = colors.white.mode1,
  isNew = false,
  id,
  level = 0
}) => {
  const { navigate, data } = useRouter()

  const [isNewPopupMenuOpen, setIsNewPopupMenuOpen] = useState(false)

  const { defaultItems } = useRecordMenuItems()

  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const handleNewClick = () => {
    setIsNewPopupMenuOpen(!isNewPopupMenuOpen)
  }

  const handleFileClick = () => {
    navigate('vault', { recordType: data.recordType, recordId: id })
  }

  const handleMenuItemClick = (item) => {
    handleCreateOrEditRecord({
      recordType: item.type,
      selectedFolder: folderId
    })

    setIsNewPopupMenuOpen(false)
  }

  return html`
    <${NestedFileContainer} isRootScope=${level === 1}>
      ${isNew
        ? html`
            <${PopupMenu}
              side="left"
              align="left"
              isOpen=${isNewPopupMenuOpen}
              setIsOpen=${setIsNewPopupMenuOpen}
              content=${html`
                <${CreateNewCategoryPopupContent}
                  menuItems=${defaultItems}
                  onClick=${handleMenuItemClick}
                />
              `}
            >
              <${NestedFile} color=${color} onClick=${handleNewClick}>
                <${icon} color=${colors.primary400.mode1} size="24" />
                ${name}
              <//>
            <//>
          `
        : html` <${NestedFile} color=${color} onClick=${handleFileClick}>
            <${icon} size="24" />
            ${name}
          <//>`}
    <//>
  `
}
