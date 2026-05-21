import { useMemo } from 'react'

import { useLingui } from '@lingui/react'
import { useFolders } from '@tetherto/pearpass-lib-vault'
import { html } from 'htm/react'

import { MenuItem, MenuList } from './styles'
import { CreateFolderModalContent } from '../../containers/Modal/CreateFolderModalContent/CreateFolderModalContent'
import { DeleteFolderModalContent } from '../../containers/Modal/DeleteFolderModalContent/DeleteFolderModalContent'
import { useModal } from '../../context/ModalContext'
import { DeleteIcon, FolderIcon } from '../../lib-react-components'

/**
 *
 * @param {{
 *  name: string
 * }} props
 * @returns
 */
export const EditFolderPopupContent = ({ name }) => {
  const { i18n } = useLingui()
  const { deleteFolder, data: folderData } = useFolders()
  const { setModal, closeModal } = useModal()

  const menuItems = useMemo(
    () => [
      {
        name: i18n._('Delete'),
        type: 'delete',
        icon: DeleteIcon,
        onClick: () => {
          const count = folderData?.customFolders?.[name]?.records?.length ?? 0
          if (count === 1) {
            deleteFolder(name)
            closeModal()
          } else {
            setModal(
              <DeleteFolderModalContent
                folderName={name}
                count={count - 1}
                onClose={closeModal}
              />
            )
          }
        }
      },
      {
        name: i18n._('Rename'),
        type: 'rename',
        icon: FolderIcon,
        onClick: () =>
          setModal(
            <CreateFolderModalContent
              initialValues={{ title: name }}
              onClose={closeModal}
            />
          )
      }
    ],
    [closeModal, deleteFolder, folderData, i18n, name, setModal]
  )

  const handleMenuItemClick = (e, item) => {
    e.stopPropagation()

    item.onClick()
  }

  return html`
    <${MenuList}>
      ${menuItems?.map((item) => {
        const Icon = item.icon

        return html`<${MenuItem}
          data-testid=${`folder-menuitem-${item.type}`}
          key=${item.type}
          onClick=${(e) => handleMenuItemClick(e, item)}
        >
          ${Icon && html`<${Icon} size="24" />`} ${item.name}
        <//>`
      })}
    <//>
  `
}
