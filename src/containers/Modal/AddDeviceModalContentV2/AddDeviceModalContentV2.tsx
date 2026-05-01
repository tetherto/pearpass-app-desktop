import React, { useEffect, useState } from 'react'

import { generateQRCodeSVG } from '@tetherto/pear-apps-utils-qr'
import {
  AlertMessage,
  Button,
  Dialog,
  RingSpinner,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useInvite } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './AddDeviceModalContentV2.styles'
import { useModal } from '../../../context/ModalContext'
import { useToast } from '../../../context/ToastContext'
import { useAutoLockPreferences } from '../../../hooks/useAutoLockPreferences'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard.electron'
import { useTranslation } from '../../../hooks/useTranslation'
import { ScanQRExpireTimer } from '../AddDeviceModalContent/ScanQRExpireTimer'

export const AddDeviceModalContentV2 = () => {
  const { t } = useTranslation()
  const { setToast } = useToast()
  const { closeModal } = useModal()
  const { theme } = useTheme()
  const { colors } = theme
  const [qrSvg, setQrSvg] = useState('')
  const { createInvite, deleteInvite, data } = useInvite()
  const { setShouldBypassAutoLock } = useAutoLockPreferences()
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  useEffect(() => {
    setShouldBypassAutoLock(true)
    return () => setShouldBypassAutoLock(false)
  }, [setShouldBypassAutoLock])

  useEffect(() => {
    if (!data?.publicKey) {
      createInvite()
    }

    return () => {
      deleteInvite()
    }
    // `data?.publicKey` intentionally excluded: this is a mount/unmount
    // lifecycle - create once on open, delete once on close.
  }, [createInvite, deleteInvite])

  useEffect(() => {
    if (data?.publicKey) {
      generateQRCodeSVG(data.publicKey, { type: 'svg', margin: 0 }).then(
        (value: string) => setQrSvg(value)
      )
    }
  }, [data])

  const styles = createStyles(colors)

  const handleCopyKey = () => {
    if (data?.publicKey) {
      copyToClipboard(data.publicKey)
    } else {
      setToast({
        message: t('Invite code not found')
      })
    }
  }

  const displayLink = isCopied ? t('Copied!') : (data?.publicKey ?? '')

  return (
    <Dialog
      title={t('Share Personal')}
      onClose={closeModal}
      testID="add-device-dialog-v2"
      closeButtonTestID="add-device-close-v2"
    >
      <div style={styles.body}>
        <Text variant="caption" color={colors.colorTextSecondary}>
          {t('Access Code')}
        </Text>
        <div style={styles.accessPanel}>
          <div style={styles.qrWrap}>
            <div
              style={styles.qrInner}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
          <div style={styles.timerRow}>
            <RingSpinner />
            <div style={styles.timerTextRow}>
              <Text as="span" variant="label" color={colors.colorTextSecondary}>
                {t('Code expires in')}
              </Text>
              <ScanQRExpireTimer withSuffix onFinish={closeModal} />
            </div>
          </div>
          <div role="separator" style={styles.divider} />
          <div style={styles.vaultLinkSection}>
            <div style={styles.vaultLinkTextColumn}>
              <Text variant="caption" color={colors.colorTextSecondary}>
                {t('Vault Link')}
              </Text>
              <div style={styles.vaultLinkValue} title={data?.publicKey ?? ''}>
                <Text as="span" variant="label" color={colors.colorTextPrimary}>
                  {displayLink}
                </Text>
              </div>
            </div>
            <Button
              variant="tertiary"
              size="small"
              aria-label={t('Copy vault key')}
              data-testid="add-device-v2-copy-link"
              onClick={handleCopyKey}
            >
              <ContentCopy
                width={24}
                height={24}
                color={colors.colorTextPrimary}
              />
            </Button>
          </div>
        </div>
        <AlertMessage
          variant="info"
          size="small"
          title=""
          description={t(
            'Keep your vault private. Only pair with your own trusted devices. Pairing grants full access to your PearPass data.'
          )}
          testID="pairing-disclaimer"
        />
      </div>
    </Dialog>
  )
}
