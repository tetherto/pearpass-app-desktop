import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useFolders, useRecords } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './MainViewV2.styles'
import {
  SORT_BY_TYPE,
  SORT_KEYS,
  type SortKey
} from '../../constants/sortOptions'
import { BrowserExtensionDialogV2 } from '../../containers/Modal/BrowserExtensionDialogV2'
import { DeleteRecordsModalContentV2 } from '../../containers/Modal/DeleteRecordsModalContentV2'
import { MoveFolderModalContentV2 } from '../../containers/Modal/MoveFolderModalContentV2/MoveFolderModalContentV2'
import { EmptyCollectionViewV2 } from '../../containers/EmptyCollectionViewV2'
import { EmptyResultsViewV2 } from '../../containers/EmptyResultsViewV2'
import { MainViewHeader } from '../../containers/MainViewHeader/MainViewHeader'
import { MultiSelectActionsBar } from '../../containers/MultiSelectActionsBar'
import { RecordListViewV2 } from '../../containers/RecordListView/RecordListViewV2'
import { useAppHeaderContext } from '../../context/AppHeaderContext'
import { useGlobalLoading } from '../../context/LoadingContext'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { LOCAL_STORAGE_KEYS } from '../../constants/localStorage'
import { isNativeMessagingIPCRunning } from '../../services/nativeMessagingIPCServer'
import { getNativeMessagingEnabled } from '../../services/nativeMessagingPreferences'
import {
  groupRecordsByTimePeriod,
  type VaultRecord
} from '../../utils/groupRecordsByTimePeriod'
import { isFavorite } from '../../utils/isFavorite'

export const MainViewV2 = () => {
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setModal, isOpen: isModalOpen } = useModal()
  const { searchValue } = useAppHeaderContext()
  const { data: routerData } = useRouter()

  const [sortKey, setSortKey] = useState<SortKey>(
    SORT_KEYS.LAST_UPDATED_NEWEST
  )
  const [isMultiSelectOn, setIsMultiSelectOn] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])

  useEffect(() => {
    if (!isMultiSelectOn) setSelectedRecords([])
  }, [isMultiSelectOn])

  useEffect(() => {
    const dismissed =
      localStorage.getItem(LOCAL_STORAGE_KEYS.EXTENSION_DIALOG_DISMISSED) === 'true'
    if (dismissed) return

    const enabled = getNativeMessagingEnabled()
    const isRunning = isNativeMessagingIPCRunning()

    if (!enabled || !isRunning) {
      setModal(<BrowserExtensionDialogV2 />)
    }
    // Run once per mount; modal setter is stable per context instance.
  }, [setModal])

  const isFavoritesView = isFavorite(routerData?.folder ?? '')
  const selectedFolder =
    routerData?.folder && !isFavoritesView ? routerData.folder : undefined

  const sort = useMemo(() => SORT_BY_TYPE[sortKey], [sortKey])

  const { data: records, isLoading, updateFavoriteState } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        searchPattern: searchValue,
        type:
          routerData?.recordType === 'all' ? undefined : routerData?.recordType,
        folder: selectedFolder,
        isFavorite: isFavoritesView ? true : undefined
      },
      sort
    }
  })

  useGlobalLoading({ isLoading })

  const sections = useMemo(
    () => groupRecordsByTimePeriod(records ?? [], sort),
    [records, sort]
  )

  useEffect(() => {
    setIsMultiSelectOn(false)
  }, [routerData?.folder, routerData?.recordType, searchValue])

  const selectedRecordObjects = useMemo<VaultRecord[]>(() => {
    if (!records?.length || !selectedRecords.length) return []
    const ids = new Set(selectedRecords)
    return records.filter((record: VaultRecord) => ids.has(record.id))
  }, [records, selectedRecords])

  const selectedCount = selectedRecordObjects.length
  const allSelectedFavorited =
    selectedCount > 0 && selectedRecordObjects.every((r) => !!r.isFavorite)

  const { data: foldersData } = useFolders()
  const hasCustomFolders =
    Object.keys(foldersData?.customFolders ?? {}).length > 0

  const exitMultiSelect = useCallback(() => {
    setSelectedRecords([])
    setIsMultiSelectOn(false)
  }, [])

  useEffect(() => {
    if (!isMultiSelectOn || isModalOpen) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') exitMultiSelect()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isMultiSelectOn, isModalOpen, exitMultiSelect])

  const handleMove = () => {
    if (!selectedCount) return
    setModal(
      <MoveFolderModalContentV2
        records={selectedRecordObjects}
        onCompleted={exitMultiSelect}
      />
    )
  }

  const handleDelete = () => {
    if (!selectedCount) return
    setModal(
      <DeleteRecordsModalContentV2
        records={selectedRecordObjects}
        onCompleted={exitMultiSelect}
      />
    )
  }

  const handleToggleFavorite = async () => {
    if (!selectedCount) return
    await updateFavoriteState(selectedRecords, !allSelectedFavorited)
    exitMultiSelect()
  }

  const hasRecords = !!records?.length
  const hasSearch = !!searchValue.length

  return (
    <div style={styles.wrapper} data-testid="main-view-v2">
      <MainViewHeader
        sortKey={sortKey}
        setSortKey={setSortKey}
        isMultiSelectOn={isMultiSelectOn}
        setIsMultiSelectOn={setIsMultiSelectOn}
      />

      {isMultiSelectOn && (
        <MultiSelectActionsBar
          selectedCount={selectedCount}
          allSelectedFavorited={allSelectedFavorited}
          canMove={hasCustomFolders}
          onMove={handleMove}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      )}

      {hasRecords && (
        <RecordListViewV2
          sections={sections}
          isMultiSelectOn={isMultiSelectOn}
          selectedRecords={selectedRecords}
          setSelectedRecords={setSelectedRecords}
          setIsMultiSelectOn={setIsMultiSelectOn}
        />
      )}

      {!hasRecords && !hasSearch && !isLoading && (
        <EmptyCollectionViewV2
          recordType={routerData?.recordType ?? 'all'}
          selectedFolder={selectedFolder}
          isFavoritesView={isFavoritesView}
        />
      )}

      {!hasRecords && hasSearch && !isLoading && <EmptyResultsViewV2 />}
    </div>
  )
}
