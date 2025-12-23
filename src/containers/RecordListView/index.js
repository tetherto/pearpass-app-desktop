import React, { useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useRecords } from 'pearpass-lib-vault'

import {
  ActionsSection,
  DatePeriod,
  Folder,
  LeftActions,
  RecordsSection,
  RightActions,
  ViewWrapper
} from './styles'
import { isStartOfLast14DaysGroup, isStartOfLast7DaysGroup } from './utils'
import { PopupMenu } from '../../components/PopupMenu'
import { Record } from '../../components/Record'
import { RecordSortActionsPopupContent } from '../../components/RecordSortActionsPopupContent'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import {
  ArrowUpAndDown,
  ButtonFilter,
  DeleteIcon,
  FolderIcon,
  MoveToIcon,
  MultiSelectionIcon,
  StarIcon,
  TimeIcon,
  XIcon
} from '../../lib-react-components'
import { ConfirmationModalContent } from '../Modal/ConfirmationModalContent'
import { MoveFolderModalContent } from '../Modal/MoveFolderModalContent'

/**
 * @param {{
 *  records: Array<{
 *    id: string
 *    createdAt: number
 *    updatedAt: number
 *    isFavorite: boolean
 *    vaultId: string
 *    folder: string
 *    data: {
 *      title: string
 *      [key: string]: any
 *    }
 *  }>,
 *  selectedRecords: Array<{id: string}>,
 *  setSelectedRecords: () => void
 * }} props
 */
export const RecordListView = ({
  records,
  selectedRecords,
  setSelectedRecords,
  sortType,
  setSortType
}) => {
  const { i18n } = useLingui()
  const { currentPage, navigate, data: routeData } = useRouter()
  const { setModal, closeModal } = useModal()

  const { deleteRecords } = useRecords()

  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false)
  const [isMultiSelect, setIsMultiSelect] = useState(false)

  const sortActions = [
    { name: i18n._('Recent'), icon: TimeIcon, type: 'recent' },
    {
      name: i18n._('Newest to oldest'),
      icon: ArrowUpAndDown,
      type: 'newToOld'
    },
    { name: i18n._('Oldest to newest'), icon: ArrowUpAndDown, type: 'oldToNew' }
  ]

  const isRecordsSelected = selectedRecords.length > 0
  const isFavorite = routeData.folder === 'favorites'

  const selectedSortAction = sortActions.find(
    (action) => action.type === sortType
  )

  const openRecordDetails = (record) => {
    navigate(currentPage, {
      recordId: record?.id,
      recordType: routeData.recordType
    })
  }

  const handleSelect = (record, isSelected) => {
    setIsMultiSelect(true)

    setSelectedRecords((prev) =>
      isSelected
        ? prev.filter((selectedRecord) => selectedRecord.id !== record?.id)
        : [...prev, record]
    )
  }

  const handleRecordClick = (record, isSelected) => {
    if (isMultiSelect) {
      handleSelect(record, isSelected)
      return
    }

    openRecordDetails(record)
  }

  const handleSortTypeChange = (type) => {
    setSortType(type)
  }

  const onClearSelection = () => {
    setSelectedRecords([])

    setIsMultiSelect(false)
  }

  const handleDeleteConfirm = async () => {
    await deleteRecords(selectedRecords.map((record) => record?.id))

    onClearSelection()

    closeModal()
  }

  const handleDelete = async () => {
    setModal(html`
      <${ConfirmationModalContent}
        title=${i18n._('Are you sure to delete this item(s)?')}
        text=${i18n._('This is permanent and cannot be undone')}
        primaryLabel=${i18n._('No')}
        secondaryLabel=${i18n._('Yes')}
        secondaryAction=${handleDeleteConfirm}
        primaryAction=${closeModal}
      />
    `)
  }

  const handleMoveClick = () => {
    setModal(html`
      <${MoveFolderModalContent}
        records=${selectedRecords}
        onCompleted=${() => onClearSelection()}
      />
    `)
  }

  return html`
    <${ViewWrapper}>
      <${ActionsSection}>
        <${LeftActions}>
          ${isMultiSelect
            ? html`<${ButtonFilter}
                  isDisabled=${!isRecordsSelected}
                  startIcon=${MoveToIcon}
                  onClick=${handleMoveClick}
                >
                  ${i18n._('Move')}
                <//>

                <${ButtonFilter}
                  isDisabled=${!isRecordsSelected}
                  startIcon=${DeleteIcon}
                  onClick=${handleDelete}
                >
                  ${i18n._('Delete')}
                <//> `
            : html`<${PopupMenu}
                side="left"
                align="left"
                isOpen=${isSortPopupOpen}
                setIsOpen=${setIsSortPopupOpen}
                content=${html` <${RecordSortActionsPopupContent}
                  onClick=${handleSortTypeChange}
                  onClose=${() => setIsSortPopupOpen(false)}
                  selectedType=${sortType}
                  menuItems=${sortActions}
                />`}
              >
                <${ButtonFilter} startIcon=${selectedSortAction.icon}>
                  ${selectedSortAction.name}
                <//>
              <//> `}
        <//>

        <${RightActions}>
          ${isMultiSelect
            ? html`<${ButtonFilter}
                onClick=${onClearSelection}
                startIcon=${XIcon}
              >
                ${i18n._('Cancel')}
              <//>`
            : html`<${ButtonFilter}
                onClick=${() => setIsMultiSelect(true)}
                startIcon=${MultiSelectionIcon}
              >
                ${i18n._('Multiple selection')}
              <//> `}
        <//>
      <//>

      ${!isMultiSelect &&
      !!routeData?.folder?.length &&
      (isFavorite
        ? html`<${Folder}><${StarIcon} /> ${i18n._('Favorite')}<//>`
        : html`<${Folder}><${FolderIcon} /> ${routeData.folder}<//>`)}

      <${RecordsSection}>
        ${records.map((record, index) => {
          if (!record?.data) {
            return html``
          }

          const isSelected = selectedRecords.some(
            (selectedRecord) => selectedRecord.id === record?.id
          )

          const isStartOfLast7Days = isStartOfLast7DaysGroup(
            record,
            index,
            records
          )

          const isStartOfLast14Days = isStartOfLast14DaysGroup(
            record,
            index,
            records
          )

          return html`
            <${React.Fragment} key=${record?.id}>
              ${isStartOfLast7Days &&
              html`<${DatePeriod}> ${i18n._('Last 7 days')} <//>`}
              ${isStartOfLast14Days &&
              html`<${DatePeriod}> ${i18n._('Last 14 days')} <//>`}

              <${Record}
                testId="recordList-record-container"
                record=${record}
                isSelected=${isSelected}
                onSelect=${() => handleSelect(record, isSelected)}
                onClick=${() => handleRecordClick(record, isSelected)}
              />
            <//>
          `
        })}
      <//>
    <//>
  `
}
