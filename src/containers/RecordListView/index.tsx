import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { useLingui } from '@lingui/react'
// TS typings for this package miss the named hook export used across the app.
// @ts-expect-error - runtime export exists, declaration file is incomplete.
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
import { FAVORITES_FOLDER_ID } from '../../utils/isFavorite'
import { ConfirmationModalContent } from '../Modal/ConfirmationModalContent'
import { MoveFolderModalContent } from '../Modal/MoveFolderModalContent'

const ITEM_HEIGHT_RECORD = 45
const ITEM_HEIGHT_HEADER = 30
const ITEM_GAP = 5
const OVERSCAN = 5

type VirtualItem =
  | { kind: 'header'; label: string; index: number }
  | { kind: 'record'; record: RecordItem; index: number }

type SortType = 'recent' | 'newToOld' | 'oldToNew'

type RecordItem = {
  id: string
  createdAt: number
  updatedAt: number
  isFavorite: boolean
  vaultId: string
  folder: string
  type: 'note' | 'creditCard' | 'custom' | 'identity' | 'login'
  data?: {
    title?: string
    [key: string]: unknown
  }
  otpPublic?: {
    currentCode?: string | null
  }
}

type SortAction = {
  name: string
  icon: React.ComponentType
  type: SortType
}

type RecordListViewProps = {
  records: RecordItem[]
  selectedRecords: RecordItem[]
  setSelectedRecords: Dispatch<SetStateAction<RecordItem[]>>
  sortType: SortType
  setSortType: (type: SortType) => void
}

const PopupMenuComponent = PopupMenu as React.ComponentType<{
  direction:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topRight'
    | 'topLeft'
    | 'bottomRight'
    | 'bottomLeft'
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  content: React.ReactNode
  children: React.ReactNode
}>
const RecordComponent = Record as React.ComponentType<{
  testId: string
  dataId: string
  record: RecordItem
  isSelected: boolean
  otpCode: string | null
  onSelect: (record: RecordItem, isSelected: boolean) => void
  onClick: (record: RecordItem, isSelected: boolean) => void
}>
const RecordSortActionsPopupContentComponent =
  RecordSortActionsPopupContent as unknown as React.ComponentType<{
    onClick: (type: SortType) => void
    onClose: () => void
    selectedType: SortType
    menuItems: SortAction[]
  }>

export const RecordListView = ({
  records,
  selectedRecords,
  setSelectedRecords,
  sortType,
  setSortType
}: RecordListViewProps) => {
  const { i18n } = useLingui()
  const { currentPage, navigate, data: routeData } = useRouter()
  const { setModal, closeModal } = useModal()

  const { deleteRecords } = useRecords()

  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false)
  const [isMultiSelect, setIsMultiSelect] = useState(false)

  const navigateRef = useRef(navigate)
  const currentPageRef = useRef(currentPage)
  const recordTypeRef = useRef(routeData.recordType)
  const isMultiSelectRef = useRef(isMultiSelect)

  navigateRef.current = navigate
  currentPageRef.current = currentPage
  recordTypeRef.current = routeData.recordType
  isMultiSelectRef.current = isMultiSelect

  const sortActions: SortAction[] = [
    { name: i18n._('Recent'), icon: TimeIcon, type: 'recent' },
    {
      name: i18n._('Newest to oldest'),
      icon: ArrowUpAndDown,
      type: 'newToOld'
    },
    { name: i18n._('Oldest to newest'), icon: ArrowUpAndDown, type: 'oldToNew' }
  ]

  const selectedRecordIds = useMemo(
    () => new Set(selectedRecords.map((r) => r.id)),
    [selectedRecords]
  )

  // Refs & scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(600)

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) setScrollTop(scrollContainerRef.current.scrollTop)
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const flatItems = useMemo((): VirtualItem[] => {
    const result: VirtualItem[] = []
    records.forEach((record, originalIndex) => {
      if (!record?.data) return
      if (isStartOfLast7DaysGroup(record, originalIndex, records))
        result.push({ kind: 'header', label: i18n._('Last 7 days'), index: result.length })
      if (isStartOfLast14DaysGroup(record, originalIndex, records))
        result.push({ kind: 'header', label: i18n._('Last 14 days'), index: result.length })
      result.push({ kind: 'record', record, index: result.length })
    })
    return result
  }, [records, i18n])

  const itemHeights = useMemo(
    () =>
      flatItems.map((item) =>
        item.kind === 'header' ? ITEM_HEIGHT_HEADER : ITEM_HEIGHT_RECORD
      ),
    [flatItems]
  )

  const itemOffsets = useMemo((): number[] => {
    let top = 0
    return flatItems.map((_, i) => {
      const offset = top
      const h = itemHeights[i]
      top += h + (i < flatItems.length - 1 ? ITEM_GAP : 0)
      return offset
    })
  }, [flatItems, itemHeights])

  const totalHeight = useMemo(() => {
    if (!flatItems.length) return 0
    const last = flatItems.length - 1
    return itemOffsets[last] + itemHeights[last]
  }, [flatItems.length, itemHeights, itemOffsets])

  const { startIndex, endIndex } = useMemo(() => {
    if (!flatItems.length) return { startIndex: 0, endIndex: -1 }
    const viewTop = scrollTop
    const viewBottom = scrollTop + containerHeight

    let lo = 0, hi = flatItems.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      const h = itemHeights[mid]
      if (itemOffsets[mid] + h <= viewTop) lo = mid + 1
      else hi = mid
    }
    let end = lo
    while (end < flatItems.length - 1 && itemOffsets[end + 1] < viewBottom) end++

    return {
      startIndex: Math.max(0, lo - OVERSCAN),
      endIndex: Math.min(flatItems.length - 1, end + OVERSCAN)
    }
  }, [scrollTop, containerHeight, flatItems, itemHeights, itemOffsets])

  const isRecordsSelected = selectedRecords.length > 0
  const isFavorite = routeData.folder === FAVORITES_FOLDER_ID

  const selectedSortAction =
    sortActions.find((action) => action.type === sortType) ?? sortActions[0]

  const openRecordDetails = useCallback((record: RecordItem) => {
    navigateRef.current(currentPageRef.current, {
      recordId: record?.id,
      recordType: recordTypeRef.current
    })
  }, [])

  const handleSelect = useCallback(
    (record: RecordItem, isSelected: boolean) => {
      setIsMultiSelect(true)

      setSelectedRecords((prev) =>
        isSelected
          ? prev.filter((selectedRecord) => selectedRecord.id !== record?.id)
          : [...prev, record]
      )
    },
    [setSelectedRecords]
  )

  const handleRecordClick = useCallback(
    (record: RecordItem, isSelected: boolean) => {
      if (isMultiSelectRef.current) {
        handleSelect(record, isSelected)
        return
      }

      openRecordDetails(record)
    },
    [handleSelect, openRecordDetails]
  )

  const handleSortTypeChange = (type: SortType) => {
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
    setModal(
      <ConfirmationModalContent
        title={i18n._('Are you sure to delete this item(s)?')}
        text={i18n._('This is permanent and cannot be undone')}
        primaryLabel={i18n._('No')}
        secondaryLabel={i18n._('Yes')}
        secondaryAction={handleDeleteConfirm}
        primaryAction={closeModal}
      />
    )
  }

  const handleMoveClick = () => {
    setModal(
      <MoveFolderModalContent
        records={selectedRecords}
        onCompleted={() => onClearSelection()}
      />
    )
  }

  return (
    <ViewWrapper>
      <ActionsSection>
        <LeftActions>
          {isMultiSelect ? (
            <>
              <ButtonFilter
                testId="multi-select-move-button"
                isDisabled={!isRecordsSelected}
                startIcon={MoveToIcon}
                onClick={handleMoveClick}
              >
                {i18n._('Move')}
              </ButtonFilter>

              <ButtonFilter
                testId="multi-select-delete-button"
                isDisabled={!isRecordsSelected}
                startIcon={DeleteIcon}
                onClick={handleDelete}
              >
                {i18n._('Delete')}
              </ButtonFilter>
            </>
          ) : (
            <PopupMenuComponent
              direction="bottomLeft"
              isOpen={isSortPopupOpen}
              setIsOpen={setIsSortPopupOpen}
              content={
                <RecordSortActionsPopupContentComponent
                  onClick={handleSortTypeChange}
                  onClose={() => setIsSortPopupOpen(false)}
                  selectedType={sortType}
                  menuItems={sortActions}
                />
              }
            >
              <ButtonFilter
                testId="sort-dropdown-button"
                startIcon={selectedSortAction.icon}
                onClick={() => setIsSortPopupOpen((prev) => !prev)}
              >
                {selectedSortAction.name}
              </ButtonFilter>
            </PopupMenuComponent>
          )}
        </LeftActions>

        <RightActions>
          {isMultiSelect ? (
            <ButtonFilter
              testId="multi-select-cancel-button"
              onClick={onClearSelection}
              startIcon={XIcon}
            >
              {i18n._('Cancel')}
            </ButtonFilter>
          ) : (
            <ButtonFilter
              testId="multi-select-button"
              onClick={() => setIsMultiSelect(true)}
              startIcon={MultiSelectionIcon}
            >
              {i18n._('Multiple selection')}
            </ButtonFilter>
          )}
        </RightActions>
      </ActionsSection>

      {!isMultiSelect &&
        !!routeData?.folder?.length &&
        (isFavorite ? (
          <Folder>
            <StarIcon /> {i18n._('Favorite')}
          </Folder>
        ) : (
          <Folder>
            <FolderIcon /> {routeData.folder}
          </Folder>
        ))}

      <RecordsSection ref={scrollContainerRef} style={{ height: totalHeight || undefined }}>
        {flatItems.slice(startIndex, endIndex + 1).map((item) => {
          const top = itemOffsets[item.index]
          if (item.kind === 'header') {
            return (
              <DatePeriod
                key={`header-${item.label}`}
                style={{ position: 'absolute', top, left: 0, right: 0, height: ITEM_HEIGHT_HEADER }}
              >
                {item.label}
              </DatePeriod>
            )
          }
          const { record } = item

          const isSelected = selectedRecordIds.has(record.id)
          return (
            <div
              key={record.id}
              style={{ position: 'absolute', top, left: 0, right: 0, height: ITEM_HEIGHT_RECORD }}
            >
              <RecordComponent
                testId="recordList-record-container"
                dataId={`${record.type}-list-item`}
                record={record}
                isSelected={selectedRecordIds.has(record.id)}
                otpCode={record?.otpPublic?.currentCode ?? null}
                onSelect={() => handleSelect(record, isSelected)}
                onClick={() => handleRecordClick(record, isSelected)}
              />
            </div>
          )
        })}
      </RecordsSection>
    </ViewWrapper>
  )
}
