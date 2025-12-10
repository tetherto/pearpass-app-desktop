import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useRecords } from 'pearpass-lib-vault'

import { ConfirmationModalContent } from '../containers/Modal/ConfirmationModalContent'
import { MoveFolderModalContent } from '../containers/Modal/MoveFolderModalContent'
import { useModal } from '../context/ModalContext'
import { useRouter } from '../context/RouterContext'

/**
 * @param {{
 *  excludeType: Array<string>
 *  record: {
 *    id: string
 *  }
 *  onSelect: () => void
 *  onClose: () => void
 * }}
 *
 * @returns {{
 *  actions: Array<{
 *  name: string,
 *  type: string
 * }>}}
 */
export const useRecordActionItems = ({
  excludeTypes = [],
  record,
  onSelect,
  onClose
} = {}) => {
  const { i18n } = useLingui()
  const { setModal, closeModal } = useModal()
  const { data: routerData, navigate, currentPage } = useRouter()

  const { deleteRecords, updateFavoriteState } = useRecords()

  const handleDeleteConfirm = () => {
    if (routerData?.recordId === record?.id) {
      navigate(currentPage, { ...routerData, recordId: undefined })
    }

    deleteRecords([record?.id])

    closeModal?.()
  }

  const handleDelete = () => {
    setModal(html`
      <${ConfirmationModalContent}
        title=${i18n._('Are you sure to delete this item?')}
        text=${i18n._('This is permanent and cannot be undone')}
        primaryLabel=${i18n._('No')}
        secondaryLabel=${i18n._('Yes')}
        secondaryAction=${handleDeleteConfirm}
        primaryAction=${closeModal}
      />
    `)

    onClose?.()
  }

  const handleFavoriteToggle = () => {
    updateFavoriteState([record?.id], !record?.isFavorite)

    onClose?.()
  }

  const handleSelect = () => {
    onSelect?.(record)

    onClose?.()
  }

  const handleMoveClick = () => {
    setModal(html` <${MoveFolderModalContent} records=${[record]} /> `)

    onClose?.()
  }

  const defaultActions = [
    { name: i18n._('Select element'), type: 'select', click: handleSelect },
    {
      name: i18n._(
        record?.isFavorite ? 'Remove from Favorites' : 'Mark as favorite'
      ),
      type: 'favorite',
      click: handleFavoriteToggle
    },
    {
      name: i18n._('Move to another folder'),
      type: 'move',
      click: handleMoveClick
    },
    { name: i18n._('Delete element'), type: 'delete', click: handleDelete }
  ]

  const filteredActions = excludeTypes.length
    ? defaultActions.filter((action) => !excludeTypes.includes(action.type))
    : defaultActions

  return { actions: filteredActions }
}
