import React, { useState } from 'react'

import {
  Button,
  Dialog,
  UploadField
} from '@tetherto/pearpass-lib-ui-kit'
import type { UploadedFile } from '@tetherto/pearpass-lib-ui-kit'

import { createStyles } from './UploadFilesModalContent.styles'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

export type UploadFilesModalContentProps = {
  type?: 'file' | 'image'
  accepts?: string
  onFilesSelected?: (files: File[]) => void
}

export const UploadFilesModalContent = ({
  type = 'file',
  accepts,
  onFilesSelected
}: UploadFilesModalContentProps) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const styles = createStyles()

  const [files, setFiles] = useState<UploadedFile[]>([])

  const isTypeImage = type === 'image'
  const acceptedFormats = accepts
    ? accepts.split(',').map((a) => a.trim()).filter(Boolean)
    : undefined

  const handleSubmit = () => {
    if (!files.length) return
    onFilesSelected?.(files.map((f) => f.file))
    closeModal()
  }

  return (
    <Dialog
      title={isTypeImage ? t('Upload Picture') : t('Upload Attachment')}
      onClose={closeModal}
      testID="uploadfiles-dialog"
      closeButtonTestID="uploadfiles-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="uploadfiles-button-discard"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={files.length === 0}
            onClick={handleSubmit}
            data-testid="uploadfiles-button-additem"
          >
            {t('Add Item')}
          </Button>
        </>
      }
    >
      <div style={styles.body}>
        <UploadField
          files={files}
          onFilesChange={setFiles}
          allowDragAndDrop
          acceptedFormats={acceptedFormats}
          uploadLinkText={t('Upload file')}
          uploadSuffixText={t('or drag and drop it here')}
          testID="uploadfiles-field"
        />
      </div>
    </Dialog>
  )
}
