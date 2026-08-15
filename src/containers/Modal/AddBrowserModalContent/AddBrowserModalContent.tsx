import React, { useState } from 'react'

import { Button, Dialog, InputField, Text } from '@tetherto/pearpass-lib-ui-kit'

import { createStyles } from './AddBrowserModalContent.styles'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

type AddBrowserModalContentProps = {
  onSubmit: (label: string) => Promise<void>
}

export const AddBrowserModalContent = ({
  onSubmit
}: AddBrowserModalContentProps) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const styles = createStyles()

  const [label, setLabel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Replaces this modal with the pairing code on success
      await onSubmit(label)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      title={t('Add Browser Extension')}
      onClose={closeModal}
      testID="add-browser-dialog"
      closeButtonTestID="add-browser-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="add-browser-cancel"
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            data-testid="add-browser-continue"
          >
            {t('Continue')}
          </Button>
        </>
      }
    >
      <div style={styles.body}>
        <Text as="p" variant="label">
          {t(
            'Name this browser so you can recognise it later. The next screen shows a one-time code that pairs this browser only.'
          )}
        </Text>

        <InputField
          label={t('Browser name')}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder={t('Chrome — work laptop')}
          testID="add-browser-label"
        />
      </div>
    </Dialog>
  )
}
