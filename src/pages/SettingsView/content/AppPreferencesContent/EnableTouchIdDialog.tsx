import React, { useCallback, useState } from 'react'

import {
  Button,
  Dialog,
  Form,
  PasswordField,
  Text
} from '@tetherto/pearpass-lib-ui-kit'
import { getMasterEncryption, useUserData } from '@tetherto/pearpass-lib-vault'
import {
  clearBuffer,
  stringToBuffer
} from '@tetherto/pearpass-lib-vault/src/utils/buffer'

import { LOCAL_STORAGE_KEYS } from '../../../../constants/localStorage'
import { useTranslation } from '../../../../hooks/useTranslation'
import { logger } from '../../../../utils/logger'

type EnableTouchIdDialogProps = {
  closeModal: () => void
  onEnabled: () => void
}

export const EnableTouchIdDialog = ({
  closeModal,
  onEnabled
}: EnableTouchIdDialogProps) => {
  const { t } = useTranslation()
  const { logIn } = useUserData()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (isLoading) {
      return
    }

    if (!password) {
      setError(t('Password is required'))
      return
    }

    const passwordBuffer = stringToBuffer(password)

    try {
      setIsLoading(true)
      setError('')

      // Verify master password
      try {
        await logIn({ password: passwordBuffer })
      } catch {
        setError(t('Invalid master password'))
        return
      }

      // Retrieve Argon2id-derived vault credentials for keychain storage
      let encryption
      try {
        encryption = await getMasterEncryption()
      } catch (encErr) {
        logger.error('EnableTouchIdDialog', 'getMasterEncryption failed', encErr)
        throw new Error('Failed to retrieve vault encryption credentials')
      }

      if (
        !encryption?.ciphertext ||
        !encryption?.nonce ||
        !encryption?.hashedPassword
      ) {
        throw new Error('Incomplete vault encryption credentials')
      }

      // Store in biometric keychain
      const api = window.electronAPI
      if (!api?.storeBiometricCredentials) {
        throw new Error('Biometric keychain is not available')
      }

      await api.storeBiometricCredentials({
        ciphertext: encryption.ciphertext,
        nonce: encryption.nonce,
        salt: encryption.salt || '',
        hashedPassword: encryption.hashedPassword
      })

      localStorage.setItem(
        LOCAL_STORAGE_KEYS.BIOMETRIC_LOGIN_ENABLED,
        'true'
      )

      onEnabled()
      closeModal()
    } catch (err) {
      logger.error('EnableTouchIdDialog', 'Failed to enable Touch ID', err)
      setError(t('Failed to enable Touch ID. Please try again.'))
    } finally {
      clearBuffer(passwordBuffer)
      setIsLoading(false)
    }
  }, [isLoading, password, logIn, t, onEnabled, closeModal])

  const handleClose = useCallback(() => {
    if (!isLoading) {
      closeModal()
    }
  }, [isLoading, closeModal])

  return (
    <Dialog
      title={t('Enable Touch ID')}
      onClose={handleClose}
      closeOnOutsideClick={false}
      testID="settings-biometric-dialog"
      closeButtonTestID="settings-biometric-cancel"
      footer={
        <Button
          variant="primary"
          size="small"
          type="button"
          isLoading={isLoading}
          onClick={handleSubmit}
          data-testid="settings-biometric-confirm"
        >
          {t('Confirm')}
        </Button>
      }
    >
      <Form
        onSubmit={(e: { preventDefault: () => void }) => {
          e.preventDefault()
          handleSubmit()
        }}
        testID="settings-biometric-form"
      >
        <Text as="p" variant="body">
          {t('Enter your master password to enable Touch ID unlock.')}
        </Text>

        <PasswordField
          label={t('Password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error || undefined}
          testID="settings-biometric-password"
        />
      </Form>
    </Dialog>
  )
}
