import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { createPortal } from 'react-dom'

import { UNSUPPORTED } from '@tetherto/pearpass-lib-constants'
import { NavbarListItem, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import {
  CheckBox,
  CopyAll,
  DriveFileMoveOutlined,
  EditOutlined,
  Share,
  StarOutlined,
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'
// @ts-expect-error - declaration file is incomplete
import { useCreateRecord, useRecords, vaultGetFile } from '@tetherto/pearpass-lib-vault'

import {
  createStyles,
  RECORD_ROW_CONTEXT_MENU_WIDTH
} from './RecordRowContextMenu.styles'
import { useModal } from '../../context/ModalContext'
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'
import { useTranslation } from '../../hooks/useTranslation'
import { logger } from '../../utils/logger'
import type { VaultRecord } from '../../utils/groupRecordsByTimePeriod'
import { DeleteRecordsModalContent } from '../Modal/DeleteRecordsModalContent'
import { MoveFolderModalContent } from '../Modal/MoveFolderModalContent/MoveFolderModalContent'

const VIEWPORT_MARGIN = 8

const MENU_BOX_SHADOW =
  '0 185px 52px 0 rgba(8,10,5,0.01), 0 118px 47px 0 rgba(8,10,5,0.06), 0 67px 40px 0 rgba(8,10,5,0.20), 0 30px 30px 0 rgba(8,10,5,0.34), 0 7px 16px 0 rgba(8,10,5,0.39)'

type RecordRowContextMenuProps = {
  record: VaultRecord
  open: boolean
  position: { x: number; y: number }
  onOpenChange: (open: boolean) => void
  setIsMultiSelectOn?: (value: boolean) => void
  setSelectedRecords?: (
    updater: string[] | ((prev: string[]) => string[])
  ) => void
}

type FileAttachment = { id: string; name: string }

export const RecordRowContextMenu = ({
  record,
  open,
  position,
  onOpenChange,
  setIsMultiSelectOn,
  setSelectedRecords
}: RecordRowContextMenuProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setModal } = useModal()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const { updateFavoriteState } = useRecords() as {
    updateFavoriteState: (ids: string[], value: boolean) => Promise<void> | void
  }
  const { createRecord } = useCreateRecord()

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const handleEdit = useCallback(() => {
    close()
    handleCreateOrEditRecord({
      recordType: record.type,
      initialRecord: record
    })
  }, [close, handleCreateOrEditRecord, record])

  const handleToggleFavorite = useCallback(() => {
    close()
    void updateFavoriteState([record.id], !record.isFavorite)
  }, [close, updateFavoriteState, record.id, record.isFavorite])

  const handleSelectItem = useCallback(() => {
    close()
    setIsMultiSelectOn?.(true)
    setSelectedRecords?.((prev) =>
      prev.includes(record.id) ? prev : [...prev, record.id]
    )
  }, [close, setIsMultiSelectOn, setSelectedRecords, record.id])

  const handleShareItem = useCallback(() => {
    close()
  }, [close])

  const handleMove = useCallback(() => {
    close()
    setModal(<MoveFolderModalContent records={[record]} />)
  }, [close, setModal, record])

  const fetchFileBuffers = useCallback(
    async (files: FileAttachment[] | undefined) => {
      if (!files?.length) return []
      return Promise.all(
        files.map(async ({ id, name }) => {
          const buffer = await vaultGetFile(`record/${record.id}/file/${id}`)
          return { name, buffer }
        })
      )
    },
    [record.id]
  )

  const handleDuplicate = useCallback(async () => {
    close()
    try {
      const data: Record<string, unknown> = { ...(record.data ?? {}) }

      data.attachments = await fetchFileBuffers(
        record.data?.attachments as FileAttachment[] | undefined
      )

      if (record.type === 'identity') {
        data.passportPicture = await fetchFileBuffers(
          record.data?.passportPicture as FileAttachment[] | undefined
        )
        data.idCardPicture = await fetchFileBuffers(
          record.data?.idCardPicture as FileAttachment[] | undefined
        )
        data.drivingLicensePicture = await fetchFileBuffers(
          record.data?.drivingLicensePicture as FileAttachment[] | undefined
        )
      }

      await createRecord({
        type: record.type,
        folder: record.folder,
        isFavorite: record.isFavorite,
        data
      })
    } catch (error) {
      logger.error('RecordRowContextMenu', 'Failed to duplicate record', error)
    }
  }, [close, createRecord, fetchFileBuffers, record])

  const handleDelete = useCallback(() => {
    close()
    setModal(<DeleteRecordsModalContent records={[record]} />)
  }, [close, setModal, record])

  const textPrimary = theme.colors.colorTextPrimary
  const destructive = theme.colors.colorSurfaceDestructiveElevated

  const items = useMemo(
    () => [
      {
        key: 'edit',
        label: t('Edit'),
        icon: <EditOutlined color={textPrimary} />,
        onClick: handleEdit
      },
      {
        key: 'favorite',
        label: record.isFavorite
          ? t('Remove from Favorites')
          : t('Add to Favorites'),
        icon: <StarOutlined color={textPrimary} />,
        onClick: handleToggleFavorite
      },
      {
        key: 'select',
        label: t('Select Item'),
        icon: <CheckBox color={textPrimary} />,
        onClick: handleSelectItem
      },
      ...(UNSUPPORTED
        ? [
            {
              key: 'share',
              label: t('Share Item'),
              icon: <Share color={textPrimary} />,
              onClick: handleShareItem
            }
          ]
        : []),
      {
        key: 'move',
        label: t('Move to Another Folder'),
        icon: <DriveFileMoveOutlined color={textPrimary} />,
        onClick: handleMove
      },
      {
        key: 'duplicate',
        label: t('Duplicate'),
        icon: <CopyAll color={textPrimary} />,
        onClick: handleDuplicate
      }
    ],
    [
      t,
      textPrimary,
      record.isFavorite,
      handleEdit,
      handleToggleFavorite,
      handleSelectItem,
      handleShareItem,
      handleMove,
      handleDuplicate
    ]
  )

  const menuRef = useRef<HTMLDivElement>(null)
  // null until measured — keeps the menu hidden to avoid a one-frame flash.
  const [coords, setCoords] = useState<{
    top: number
    left: number
  } | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }
    const el = menuRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const viewportWidth =
      typeof window !== 'undefined' ? window.innerWidth : Infinity
    const viewportHeight =
      typeof window !== 'undefined' ? window.innerHeight : Infinity

    const maxLeft = Math.max(
      VIEWPORT_MARGIN,
      viewportWidth - rect.width - VIEWPORT_MARGIN
    )
    const left = Math.min(Math.max(position.x, VIEWPORT_MARGIN), maxLeft)

    const fitsBelow =
      position.y + rect.height <= viewportHeight - VIEWPORT_MARGIN
    const top = fitsBelow
      ? position.y
      : Math.max(VIEWPORT_MARGIN, position.y - rect.height)

    setCoords({ top, left })
  }, [open, position.x, position.y])

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, close])

  if (!open || typeof document === 'undefined') return null

  const visibility = coords === null ? 'hidden' : 'visible'
  const top = coords?.top ?? position.y
  const left = coords?.left ?? position.x

  return createPortal(
    <>
      <div
        onClick={close}
        onContextMenu={(event) => event.preventDefault()}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'transparent',
          zIndex: 999
        }}
      />
      <div
        ref={menuRef}
        role="menu"
        data-testid={`record-row-menu-${record.id}`}
        onClick={close}
        style={{
          position: 'fixed',
          top,
          left,
          width: RECORD_ROW_CONTEXT_MENU_WIDTH,
          visibility,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 4,
          backgroundColor: theme.colors.colorSurfacePrimary,
          border: `1px solid ${theme.colors.colorBorderPrimary}`,
          borderRadius: 8,
          paddingBlock: 4,
          paddingInline: 4,
          zIndex: 1000,
          boxSizing: 'border-box',
          boxShadow: MENU_BOX_SHADOW
        }}
      >
        {items.map((item) => (
          <NavbarListItem
            key={item.key}
            size="small"
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            testID={`record-row-menu-${item.key}-${record.id}`}
          />
        ))}
        <hr
          style={styles.menuDivider}
          data-testid={`record-row-menu-divider-${record.id}`}
        />
        <NavbarListItem
          size="small"
          variant="destructive"
          icon={<TrashOutlined color={destructive} />}
          label={t('Delete Item')}
          onClick={handleDelete}
          testID={`record-row-menu-delete-${record.id}`}
        />
      </div>
    </>,
    document.body
  )
}
