import React, { useState } from 'react'

import { Button, Dialog, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { kickDevice } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './RevokeAccessModalContentV2.styles'
import { useModal } from '../../../context/ModalContext'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { logger } from '../../../utils/logger'

export type RevokeAccessModalContentV2Props = {
  vaultId: string
  targetDeviceId: string
  deviceName: string
  onClose?: () => void
}

export const RevokeAccessModalContentV2 = ({
  vaultId,
  targetDeviceId,
  deviceName,
  onClose
}: RevokeAccessModalContentV2Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles()
  const { closeModal } = useModal()
  const { setToast } = useToast()

  const handleClose = onClose ?? closeModal

  const [isLoading, setIsLoading] = useState(false)

  const onRevoke = async () => {
    if (isLoading) return
    setIsLoading(true)
    let failures: unknown[] = []
    try {
      ;({ failures } = await kickDevice({ vaultId, targetDeviceId }))
    } catch (error) {
      logger.error('RevokeAccessModalContentV2', 'kickDevice failed:', error)
      setToast({
        message: t("Couldn't revoke access. Please try again.")
      })
      setIsLoading(false)
      return
    }

    closeModal()
    setToast({
      message: failures?.length
        ? t(
            "Couldn't reach the device. It will lose access next time it comes online."
          )
        : t('"{deviceName}" no longer has access to this vault', {
            deviceName
          })
    })
  }

  return (
    <Dialog
      title={t('Revoke access for {deviceName}?', { deviceName })}
      onClose={handleClose}
      testID="revoke-access-dialog-v2"
      closeButtonTestID="revoke-access-close-v2"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            data-testid="revoke-access-cancel-v2"
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="destructive"
            size="small"
            type="button"
            isLoading={isLoading}
            onClick={onRevoke}
            data-testid="revoke-access-submit-v2"
          >
            {t('Revoke Access')}
          </Button>
        </>
      }
    >
      <div style={styles.body} data-testid="revoke-access-body-v2">
        <div style={styles.intro}>
          <Text
            as="p"
            variant="caption"
            color={theme.colors.colorTextSecondary}
          >
            {t('This will disconnect the device from future syncing.')}
          </Text>
          <Text
            as="p"
            variant="caption"
            color={theme.colors.colorTextSecondary}
          >
            {t('Before you proceed, please note:')}
          </Text>
        </div>
        <ul style={styles.bulletList}>
          <li style={styles.bulletItem}>
            <Text as="span" variant="caption">
              {t(
                'For Your Security: We recommend moving your items to a new vault and updating your passwords. This is especially important if the device was lost or stolen, as it ensures your data remains protected even if a local copy exists on the revoked device.'
              )}
            </Text>
          </li>
          <li style={styles.bulletItem}>
            <Text as="span" variant="caption">
              {t(
                'Offline Data: Revoking access prevents future syncing, but it cannot remotely delete data that was already exported.'
              )}
            </Text>
          </li>
        </ul>
      </div>
    </Dialog>
  )
}
