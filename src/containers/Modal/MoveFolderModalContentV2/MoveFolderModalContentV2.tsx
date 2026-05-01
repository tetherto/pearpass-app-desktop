import React, { useEffect, useMemo, useRef, useState } from 'react'

// @ts-ignore - JS module without type declarations
import { generateAvatarInitials } from '@tetherto/pear-apps-utils-avatar-initials'
import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useFolders, useRecords } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './MoveFolderModalContentV2.styles'
import { RECORD_COLOR_BY_TYPE } from '../../../constants/recordColorByType'
import { FADE_GRADIENT_HEIGHT } from '../../../constants/layout'
import { useModal } from '../../../context/ModalContext'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useScrollOverflow } from '../../../hooks/useScrollOverflow'
import { useTranslation } from '../../../hooks/useTranslation'
import { Folder, Layers } from '@tetherto/pearpass-lib-ui-kit/icons'
import { RecordAvatar } from '../../../components/RecordAvatar'

const CHIP_ID_ALL = '__all__'

export type MoveFolderRecord = Record<string, unknown> & {
  id: string
  folder?: string | null
  type: string
  data?: {
    title?: string
    username?: string
    email?: string
    websites?: string[]
    [key: string]: unknown
  }
}

export type MoveFolderModalContentV2Props = {
  records: MoveFolderRecord[]
  onCompleted?: () => void
}

type FolderOption = {
  id: string
  label: string
  icon: React.ReactNode
}

function getRecordSubtitle(record: MoveFolderRecord): string {
  if (["login", 'identity'].includes(record.type)) {
    const u = record.data?.username
    const e = record.data?.email
    const w = record.data?.websites?.[0]
    return String(u || e || w || '')
  }
  if (record.folder) {
    return String(record.folder)
  }
  return ''
}

export const MoveFolderModalContentV2 = ({
  records,
  onCompleted
}: MoveFolderModalContentV2Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { closeModal } = useModal()

  const { data: folders, isLoading: isLoadingFolders } = useFolders()

  const { updateFolder, updateRecords, isLoading: isUpdating } = useRecords({
    onCompleted: closeModal
  })

  const isLoading = isUpdating || isLoadingFolders

  useGlobalLoading({ isLoading })

  const iconColor = theme.colors.colorTextPrimary

  const folderOptions = useMemo<FolderOption[]>(() => {
    const customFolders = Object.values(
      (folders?.customFolders ?? {}) as Record<string, { name: string }>
    )

    const customOptions = customFolders
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ name }) => ({
        id: name,
        label: name,
        icon: <Folder width={20} height={20} style={{ color: iconColor }} />
      }))

    return [
      {
        id: CHIP_ID_ALL,
        label: t('All Items'),
        icon: <Layers width={20} height={20} style={{ color: iconColor }} />
      },
      ...customOptions
    ]
  }, [folders, iconColor, t])

  // Preselect the chip the records currently sit at
  const defaultSelectedId = useMemo<string | null>(() => {
    if (records.length === 0) return null
    const firstFolder = records[0].folder
    if (!records.every((r) => r.folder === firstFolder)) return null
    if (!firstFolder) return CHIP_ID_ALL
    return folders?.customFolders?.[firstFolder] ? firstFolder : null
  }, [records, folders])

  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId)

  useEffect(() => {
    setSelectedId(defaultSelectedId)
  }, [defaultSelectedId])

  const atDestination =
    !!selectedId &&
    records.length > 0 &&
    (selectedId === CHIP_ID_ALL
      ? records.every((r) => !r.folder)
      : records.every((r) => r.folder === selectedId))

  const isMoveDisabled = isLoading || !selectedId || atDestination

  const itemsListRef = useRef<HTMLDivElement>(null)
  const hasItemsOverflow = useScrollOverflow(itemsListRef, [records.length])

  const isSingle = records.length === 1
  const moveDialogTitle = isSingle
    ? t('Move 1 item')
    : t('Move {count} items', { count: records.length })
  const moveSubmitLabel = isSingle ? t('Move item') : t('Move items')
  const selectedItemsLabel = isSingle ? t('Selected Item') : t('Selected Items')
  const destinationHintLabel = isSingle
    ? t('Choose the destination folder of this item')
    : t('Choose the destination folder of these items')

  const handleMove = async () => {
    if (!selectedId || isMoveDisabled) return
    if (selectedId === CHIP_ID_ALL) {
      await updateRecords(records.map((r) => ({ ...r, folder: null })))
    } else {
      await updateFolder(records.map((r) => r.id), selectedId)
    }
    onCompleted?.()
  }

  const {
    body,
    itemRow,
    itemText,
    itemsList,
    itemsListWrapper,
    fadeGradient,
    destinationHint,
    chipRow,
    itemsListHeader
  } = styles
  return (
    <Dialog
      title={moveDialogTitle}
      onClose={closeModal}
      testID="movefolder-dialog-v2"
      closeButtonTestID="movefolder-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="movefolder-discard-v2"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isMoveDisabled}
            isLoading={isLoading}
            onClick={handleMove}
            data-testid="movefolder-submit-v2"
          >
            {moveSubmitLabel}
          </Button>
        </>
      }
    >
      <div style={body}>
        <div style={itemsListHeader}>
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {selectedItemsLabel}
        </Text>
        </div>

        {records.length > 0 ? (
          <div style={itemsListWrapper}>
            <div
              ref={itemsListRef}
              style={{
                ...itemsList,
                paddingBottom: hasItemsOverflow ? FADE_GRADIENT_HEIGHT : 0
              }}
            >
              {records.map((record, index) => {
                const domain =
                  record.type === 'login'
                    ? record.data?.websites?.[0] ?? null
                    : null
                const subtitle = getRecordSubtitle(record)
                const titleText = record.data?.title ?? ''
                return (
                  <div key={record.id} style={itemRow}>
                    <RecordAvatar
                      websiteDomain={domain ?? ''}
                      initials={generateAvatarInitials(
                        record.data?.title ?? ''
                      )}
                      size="md"
                      isSelected={false}
                      // Designs intentionally omit the favorite badge in this list.
                      isFavorite={false}
                      color={
                        RECORD_COLOR_BY_TYPE[
                          record.type as keyof typeof RECORD_COLOR_BY_TYPE
                        ] ?? RECORD_COLOR_BY_TYPE.custom
                      }
                      testId={`movefolder-avatar-v2-${index}`}
                    />
                    <div style={itemText}>
                      <Text>{titleText}</Text>
                      {subtitle ? (
                        <Text
                          variant="caption"
                          color={theme.colors.colorTextSecondary}
                        >
                          {subtitle}
                        </Text>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
            {hasItemsOverflow ? (
              <div style={fadeGradient} aria-hidden="true" />
            ) : null}
          </div>
        ) : null}

        <div style={destinationHint}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {destinationHintLabel}
          </Text>
        </div>

        <div style={chipRow}>
          {folderOptions.map((opt) => {
            const { id, label, icon } = opt
            const selected = id === selectedId
            return (
              <Button
                key={id}
                variant="secondary"
                size="small"
                pressed={selected}
                iconBefore={icon}
                data-testid={`movefolder-chip-${id}`}
                onClick={() =>
                  setSelectedId((prev) => (prev === id ? null : id))
                }
              >
                {label}
              </Button>
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}
