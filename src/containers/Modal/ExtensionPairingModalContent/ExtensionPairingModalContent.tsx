import React, { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  InputField,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ContentCopy,
  Extension,
  PearpassLogo
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './ExtensionPairingModalContent.styles'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

type ExtensionPairingModalContentProps = {
  onCopy: () => void
  pairingToken: string | null
  loadingPairing: boolean
  label?: string
  expiresAt?: string
}

/**
 * Whole minutes and seconds left before `expiresAt`, or null once it passes.
 */
const getRemaining = (expiresAt?: string) => {
  if (!expiresAt) return null
  const msLeft = new Date(expiresAt).getTime() - Date.now()
  if (!Number.isFinite(msLeft) || msLeft <= 0) return null
  const totalSeconds = Math.floor(msLeft / 1000)
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: String(totalSeconds % 60).padStart(2, '0')
  }
}

export const ExtensionPairingModalContent = ({
  onCopy,
  pairingToken,
  loadingPairing,
  label,
  expiresAt
}: ExtensionPairingModalContentProps) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt))

  useEffect(() => {
    if (!expiresAt) return undefined

    setRemaining(getRemaining(expiresAt))
    const interval = setInterval(
      () => setRemaining(getRemaining(expiresAt)),
      1000
    )
    return () => clearInterval(interval)
  }, [expiresAt])

  const isExpired = Boolean(expiresAt) && remaining === null

  return (
    <Dialog
      title={t('Pair Code for Browser Extension')}
      onClose={closeModal}
      testID="extension-pairing-dialog"
      closeButtonTestID="extension-pairing-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={closeModal}
            data-testid="extension-pairing-discard"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            onClick={onCopy}
            disabled={!pairingToken || loadingPairing || isExpired}
            iconBefore={<ContentCopy width={16} height={16} />}
            data-testid="extension-pairing-copy"
          >
            {t('Copy Code')}
          </Button>
        </>
      }
    >
      <div style={styles.body}>
        <InputField
          label={label ? t('Pair Code for {label}', { label }) : t('Pair Code')}
          value={loadingPairing ? '' : (pairingToken ?? '')}
          readOnly
          copyable
          onCopy={onCopy}
          disabled={loadingPairing}
          testID="extension-pairing-token"
        />

        {expiresAt ? (
          /* @ts-ignore */
          <Text
            as="p"
            variant="caption"
            color={theme.colors.colorTextSecondary}
            data-testid="extension-pairing-expiry"
          >
            {isExpired
              ? t('This code has expired. Close this and add the browser again.')
              : t('This code pairs one browser and expires in {minutes}:{seconds}.', {
                  minutes: remaining?.minutes ?? 0,
                  seconds: remaining?.seconds ?? '00'
                })}
          </Text>
        ) : null}

        <div style={styles.instructionsBox}>
          <Text as="p" variant="label">
            {t('1. Open your browser')}
          </Text>
          <div style={styles.instructionRow}>
            <Text as="span" variant="label">
              {t('2. Click the')}
            </Text>
            <Extension
              width={16}
              height={16}
              color={theme.colors.colorPrimary}
            />
            <Text as="span" variant="label">
              {t('icon in the toolbar')}
            </Text>
          </div>
          <div style={styles.instructionRow}>
            <Text as="span" variant="label">
              {t('3. Find and click')}
            </Text>
            <PearpassLogo
              width={16}
              height={16}
              color={theme.colors.colorPrimary}
            />
            {/* @ts-ignore */}
            <Text as="span" variant="label" color={theme.colors.colorPrimary}>
              {t('PearPass')}
            </Text>
            <Text as="span" variant="label">
              {t('in the extensions list')}
            </Text>
          </div>
          <Text as="p" variant="label">
            {t('4. If prompted, pin the extension')}
          </Text>
          <Text as="p" variant="label">
            {t('5. Paste this pairing code and confirm')}
          </Text>
        </div>
      </div>
    </Dialog>
  )
}
