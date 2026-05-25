import React from 'react'

import { useCountDown } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { createStyles } from './UpdateRequiredModalContent.styles'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

export type UpdateRequiredModalContentProps = {
  onUpdate: () => void
}

export const UpdateRequiredModalContent = ({
  onUpdate
}: UpdateRequiredModalContentProps) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { theme } = useTheme()
  const styles = createStyles()

  const handleUpdateApp = () => {
    onUpdate?.()
    closeModal()
  }

  const expireTime = useCountDown({
    initialSeconds: 120,
    onFinish: handleUpdateApp
  })

  return (
    <Dialog
      title={t('Update App')}
      testID="updaterequired-dialog"
      closeOnOutsideClick={false}
      hideCloseButton
      footer={
        <div style={styles.footer}>
          <Button
            variant="primary"
            size="small"
            type="button"
            onClick={handleUpdateApp}
            data-testid="updaterequired-update"
          >
            {t('Update App')}
          </Button>
        </div>
      }
    >
      <div style={styles.body}>
        <Text as="p" variant="label" color={theme.colors.colorTextSecondary} data-testid="updaterequired-description">
          {t(
            'A newer version of PearPass is available. Please update to the latest version to continue using the app.'
          )}
        </Text>
        <div style={styles.timerRow}>
          <Text
            as="span"
            variant="label"
            color={theme.colors.colorTextSecondary}
            data-testid="updaterequired-timer-label"
          >
            {t('App will restart in:')}
          </Text>
          <Text
            as="span"
            variant="label"
            color={theme.colors.colorTextPrimary}
            data-testid="updaterequired-timer-value"
          >
            {expireTime}
          </Text>
        </div>
      </div>
    </Dialog>
  )
}
