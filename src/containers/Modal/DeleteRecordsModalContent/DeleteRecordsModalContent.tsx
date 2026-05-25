import React, { useRef } from 'react'

import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useRecords } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './DeleteRecordsModalContent.styles'
import { RecordItemIcon } from '../../../components/RecordItemIcon'
import { FADE_GRADIENT_HEIGHT } from '../../../constants/layout'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useScrollOverflow } from '../../../hooks/useScrollOverflow'
import { useTranslation } from '../../../hooks/useTranslation'
import { getRecordSubtitle } from '../../../utils/getRecordSubtitle'
import type { VaultRecord } from '../../../utils/groupRecordsByTimePeriod'

type DeleteRecordsModalContentProps = {
  records: VaultRecord[]
  onCompleted?: () => void
  onConfirm?: () => Promise<void> | void
  dialogTitle?: string
  confirmText?: string
  submitLabel?: string
}

export const DeleteRecordsModalContent = ({
  records,
  onCompleted,
  onConfirm,
  dialogTitle: dialogTitleOverride,
  confirmText: confirmTextOverride,
  submitLabel: submitLabelOverride
}: DeleteRecordsModalContentProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { closeModal } = useModal()

  const { deleteRecords, isLoading } = useRecords({
    onCompleted: closeModal
  })

  useGlobalLoading({ isLoading })

  const itemsListRef = useRef<HTMLDivElement>(null)
  const hasItemsOverflow = useScrollOverflow(itemsListRef, [records.length])

  const count = records.length
  const isSingle = count === 1

  const dialogTitle = dialogTitleOverride ?? (isSingle
    ? t('Delete 1 Item')
    : t('Delete {count} Items', { count }))

  const confirmText = confirmTextOverride ?? (isSingle
    ? t('Are you sure to delete the selected item?')
    : t('Are you sure to delete the selected items?'))

  const selectedLabel = isSingle ? t('Selected Item') : t('Selected Items')

  const submitLabel = submitLabelOverride ?? (isSingle ? t('Delete Item') : t('Delete Items'))

  const handleDelete = async () => {
    if (!count || isLoading) return
    if (onConfirm) {
      await onConfirm()
    } else {
      await deleteRecords(records.map((r) => r.id))
    }
    onCompleted?.()
  }

  return (
    <Dialog
      title={dialogTitle}
      onClose={closeModal}
      testID="delete-records-dialog"
      closeButtonTestID="delete-records-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="delete-records-discard"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="destructive"
            size="small"
            type="button"
            disabled={!count || isLoading}
            isLoading={isLoading}
            onClick={handleDelete}
            data-testid="delete-records-submit"
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <div style={styles.body}>
        <div style={styles.itemsListHeader}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {selectedLabel}
          </Text>
        </div>

        {count > 0 && (
          <div style={styles.itemsListWrapper}>
            <div
              ref={itemsListRef}
              style={{
                ...styles.itemsList,
                paddingBottom: hasItemsOverflow ? FADE_GRADIENT_HEIGHT : 0
              }}
            >
              {records.map((record) => {
                const subtitle = getRecordSubtitle(record)
                const titleText = record.data?.title ?? ''
                return (
                  <div key={record.id} style={styles.itemRow}>
                    <RecordItemIcon record={record} size={32} />
                    <div style={styles.itemText}>
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
              <div style={styles.fadeGradient} aria-hidden="true" />
            ) : null}
          </div>
        )}

        <div style={styles.confirmText}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {confirmText}
          </Text>
        </div>
      </div>
    </Dialog>
  )
}
