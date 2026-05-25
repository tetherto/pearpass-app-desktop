import React from 'react'

import { Button, Dialog } from '@tetherto/pearpass-lib-ui-kit'
import { Download } from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './DisplayPictureModalContent.styles'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

export interface DisplayPictureModalContentProps {
  url: string
  name: string
}

export const DisplayPictureModalContent = ({
  url,
  name
}: DisplayPictureModalContentProps) => {
  const { t } = useTranslation()
  const styles = createStyles()
  const { closeModal } = useModal()

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Dialog
      title={name}
      onClose={closeModal}
      testID="displaypicture-dialog"
      closeButtonTestID="displaypicture-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="displaypicture-discard"
          >
            {t('Close')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            onClick={handleDownload}
            iconBefore={<Download width={16} height={16} />}
            data-testid="displaypicture-download"
          >
            {t('Download')}
          </Button>
        </>
      }
    >
      <div style={styles.body}>
        <img src={url} alt={name} style={styles.image} />
      </div>
    </Dialog>
  )
}
