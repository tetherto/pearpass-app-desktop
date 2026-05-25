import type { ChangeEvent } from 'react'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Button, Dialog, InputField, useTheme, Text } from '@tetherto/pearpass-lib-ui-kit'
import { ContentPaste } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useVault, usePair } from '@tetherto/pearpass-lib-vault'
import { useModal } from '../../../context/ModalContext'
import { useToast } from '../../../context/ToastContext'
import { useAutoLockPreferences } from '../../../hooks/useAutoLockPreferences'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { createStyles } from './ImportItemOrVaultModalContent.styles'
import { ImportVaultPreviewModalContent } from '../ImportVaultPreviewModalContent'

export const ImportItemOrVaultModalContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { colors } = theme
  const { setToast } = useToast()
  const { closeModal, setModal } = useModal()

  const [shareLink, setShareLink] = useState('')
  const { refetch: refetchVault, addDevice } = useVault()
  const {
    pairActiveVault,
    isLoading: isPairing,
    cancelPairActiveVault
  } = usePair()
  const { setShouldBypassAutoLock } = useAutoLockPreferences()
  const shareLinkInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setShouldBypassAutoLock(true)
    return () => setShouldBypassAutoLock(false)
  }, [setShouldBypassAutoLock])

  useGlobalLoading({ isLoading: isPairing })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPairing) {
        cancelPairActiveVault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cancelPairActiveVault, isPairing])

  const handleLoadVault = useCallback(
    async (code: string) => {
      try {
        const vaultId = await pairActiveVault(code)

        if (!vaultId) {
          throw new Error('Vault ID is empty')
        }

        await refetchVault(vaultId)

        await addDevice()

        setModal(<ImportVaultPreviewModalContent />, {
          replace: true
        })
      } catch {
        setShareLink('')
        setToast({
          message: t('Something went wrong, please check invite code')
        })
      }
    },
    [pairActiveVault, refetchVault, addDevice, setModal, setToast, t]
  )

  const handleChange = (value: string) => {
    if (isPairing) {
      return
    }
    setShareLink(value)
  }

  const processPastedText = useCallback(
    (pastedText: string) => {
      const text = (pastedText ?? '').trim()
      if (!text) {
        return
      }
      setShareLink(text)
      setTimeout(() => {
        if (!isPairing) {
          void handleLoadVault(text)
        }
      }, 0)
    },
    [isPairing, handleLoadVault]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text')
      processPastedText(pastedText ?? '')
    },
    [processPastedText]
  )

  useLayoutEffect(() => {
    const el = shareLinkInputRef.current
    if (!el) {
      return
    }
    const listener = (event: Event) => {
      handlePaste(event as ClipboardEvent)
    }
    el.addEventListener('paste', listener)
    return () => {
      el.removeEventListener('paste', listener)
    }
  }, [handlePaste])

  const handlePasteClick = async () => {
    try {
      const pastedText = await navigator.clipboard.readText()
      processPastedText(pastedText)
    } catch {
      setToast({
        message: t('Failed to paste from clipboard')
      })
    }
  }

  const handleContinue = () => {
    const trimmed = shareLink.trim()
    if (!trimmed || isPairing) {
      return
    }
    void handleLoadVault(trimmed)
  }

  const styles = createStyles(colors)

  const canContinue = Boolean(shareLink.trim()) && !isPairing

  return (
    <Dialog
      title={t('Import Vault')}
      onClose={closeModal}
      testID="import-vault-dialog"
      closeButtonTestID="import-vault-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            data-testid="import-modal-discard"
            onClick={closeModal}
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            data-testid="import-modal-continue"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            {t('Continue')}
          </Button>
        </>
      }
    >
      <div style={styles.bodyColumn}>
          <Text variant="caption" color={colors.colorTextSecondary}>{t('Share Link')}</Text>
        <div style={styles.inputSection}>
          <InputField
            label={t('Vault Link')}
            placeholder={t('Enter Share Link')}
            inputRef={shareLinkInputRef}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange(e.target.value)
            }
            value={shareLink}
            testID="import-share-link-input"
            rightSlot={
              <Button
                variant="tertiary"
                size="small"
                aria-label={t('Paste from clipboard')}
                data-testid="import-share-link-paste"
                onClick={handlePasteClick}
                iconBefore={
                  <ContentPaste
                    width={18}
                    height={18}
                    color={colors.colorTextPrimary}
                  />
                }
              />
            }
          />
        </div>
        {isPairing && (
          <div style={styles.pairingHint}>
            <Text variant="caption" color={colors.colorTextSecondary}>
              {t('Click Escape to cancel pairing')}
            </Text>
          </div>
        )}
      </div>
    </Dialog>
  )
}
