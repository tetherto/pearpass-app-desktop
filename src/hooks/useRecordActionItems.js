import React from 'react'

import { useLingui } from '@lingui/react'
import { RECORD_TYPES, useRecords } from '@tetherto/pearpass-lib-vault'
import { html } from 'htm/react'

import { useCreateOrEditRecord } from './useCreateOrEditRecord'
import { DeleteRecordsModalContent } from '../containers/Modal/DeleteRecordsModalContent'
import { MoveFolderModalContent } from '../containers/Modal/MoveFolderModalContent/MoveFolderModalContent'
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
  const { setModal } = useModal()
  const { data: routerData } = useRouter()

  const { updateFavoriteState } = useRecords()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const handleDelete = () => {
    setModal(<DeleteRecordsModalContent records={[record]} />)
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

  const handleEdit = () => {
    handleCreateOrEditRecord({
      recordType:
        routerData?.recordType === RECORD_TYPES.OTP
          ? RECORD_TYPES.OTP
          : record?.type,
      initialRecord: record
    })

    onClose?.()
  }

  const handleMoveClick = () => {
    setModal(html`<${MoveFolderModalContent} records=${[record]} />`)
    onClose?.()
  }

  const defaultActions = [
    { name: i18n._('Select element'), type: 'select', click: handleSelect },
    { name: i18n._('Edit'), type: 'edit', click: handleEdit },
    {
      name: i18n._(
        record?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'
      ),
      type: 'favorite',
      click: handleFavoriteToggle
    },
    {
      name: i18n._('Move to Another Folder'),
      type: 'move',
      click: handleMoveClick
    },
    { name: i18n._('Delete Item'), type: 'delete', click: handleDelete }
  ]

  const filteredActions = excludeTypes.length
    ? defaultActions.filter((action) => !excludeTypes.includes(action.type))
    : defaultActions

  return { actions: filteredActions }
}
