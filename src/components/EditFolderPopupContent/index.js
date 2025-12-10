import { useMemo } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useFolders } from 'pearpass-lib-vault'

import { MenuItem, MenuList } from './styles'
import { ConfirmationModalContent } from '../../containers/Modal/ConfirmationModalContent'
import { CreateFolderModalContent } from '../../containers/Modal/CreateFolderModalContent'
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
  const { deleteFolder } = useFolders()
  const { setModal, closeModal } = useModal()

  const menuItems = useMemo(
    () => [
      {
        name: i18n._('Rename'),
        type: 'rename',
        icon: FolderIcon,
        onClick: () =>
          setModal(
            html`<${CreateFolderModalContent}
              initialValues=${{ title: name }}
            />`
          )
      },
      {
        name: i18n._('Delete'),
        type: 'delete',
        icon: DeleteIcon,
        onClick: () =>
          setModal(
            html`<${ConfirmationModalContent}
              primaryAction=${() => {
                deleteFolder(name)
                closeModal()
              }}
              secondaryAction=${closeModal}
              title=${i18n._('Are you sure you want to delete this folder?')}
              text=${i18n._(
                'This action will permanently delete the folder and all items contained within it. Are you sure you want to proceed?'
              )}
            />`
          )
      }
    ],
    []
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
          key=${item.type}
          onClick=${(e) => handleMenuItemClick(e, item)}
        >
          ${Icon && html`<${Icon} size="24" />`} ${item.name}
        <//>`
      })}
    <//>
  `
}
