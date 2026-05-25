import React, { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  AlertMessage,
  Button,
  Dialog,
  Form,
  Link,
  PasswordField,
  Text,
  ToggleSwitch
} from '@tetherto/pearpass-lib-ui-kit'
import {
  broadcastDeleteVault,
  useCreateVault,
  useUserData,
  useVault,
  useVaults,
  type Vault
} from '@tetherto/pearpass-lib-vault'
import {
  clearBuffer,
  stringToBuffer
} from '@tetherto/pearpass-lib-vault/src/utils/buffer'

import { createStyles } from './DeleteVaultModalContent.styles'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { useVaultSwitch } from '../../../hooks/useVaultSwitch'
import { logger } from '../../../utils/logger'
import { PairedDevicesModalContent } from '../PairedDevicesModalContent'

export type DeleteVaultModalContentProps = {
  vaultId: string
  vaultName: string
  onClose?: () => void
}

export const DeleteVaultModalContent = ({
  vaultId,
  vaultName,
  onClose
}: DeleteVaultModalContentProps) => {
  const { t } = useTranslation()
  const styles = createStyles()
  const { closeModal, setModal } = useModal()
  const { setToast } = useToast()
  const { navigate } = useRouter()
  const { switchVault } = useVaultSwitch()

  const handleClose = onClose ?? closeModal

  const { data: vaultData, deleteVaultLocal, addDevice } = useVault()
  const { data: allVaults } = useVaults()
  const { createVault } = useCreateVault()
  const devices = (vaultData as { devices?: unknown[] } | undefined)?.devices
  const deviceCount = Array.isArray(devices) ? devices.length : 0
  const showEraseFromAllDevices = deviceCount > 1

  const { logIn } = useUserData()

  const [eraseFromAllDevices, setEraseFromAllDevices] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schema = Validator.object({
    masterPassword: Validator.string().required(t('Master password is required'))
  })

  const { register, handleSubmit, values } = useForm({
    initialValues: { masterPassword: '' },
    validate: (formValues: { masterPassword: string }) =>
      schema.validate(formValues)
  })

  const { onChange: onChangeMasterPassword, ...masterPasswordFieldProps } =
    register('masterPassword')
  const masterPasswordError = masterPasswordFieldProps.error || undefined

  const onSubmit = async (formValues: { masterPassword: string }) => {
    if (isLoading) return

    setSubmitError(null)
    const passwordBuffer = stringToBuffer(formValues.masterPassword)
    setIsLoading(true)

    try {
      try {
        // Reused for password verification - throws on a wrong password.
        await logIn({ password: passwordBuffer })
      } catch {
        setSubmitError(t('Invalid master password'))
        return
      } finally {
        clearBuffer(passwordBuffer)
      }

      let broadcastFailed = false
      if (eraseFromAllDevices) {
        try {
          const { failures } = await broadcastDeleteVault(vaultId)
          if (failures?.length) broadcastFailed = true
        } catch (error) {
          broadcastFailed = true
          logger.error(
            'DeleteVaultModalContent',
            'broadcastDeleteVault failed:',
            error
          )
        }
      }

      try {
        await deleteVaultLocal(vaultId)
      } catch (error) {
        logger.error(
          'DeleteVaultModalContent',
          'deleteVaultLocal failed:',
          error
        )
        setSubmitError(t('Failed to delete vault'))
        setToast({
          message: t("Couldn't delete vault files. Please try again.")
        })
        return
      }

      if (broadcastFailed) {
        setToast({
          message: t(
            "Couldn't reach other devices. They will sync next time they come online."
          )
        })
      }

      closeModal()
      setToast({
        message: t('"{vaultName}" was deleted from this device', { vaultName })
      })

      const nextVault = (allVaults ?? []).find(
        (v: Vault) => v.id !== vaultId
      )
      if (nextVault) {
        await switchVault(nextVault)
      } else {
        try {
          await createVault({ name: t('Personal') })
          await addDevice()
          navigate('vault', { recordType: 'all' })
          setToast({
            message: t('A new "Personal" vault was created')
          })
        } catch (error) {
          logger.error(
            'DeleteVaultModalContent',
            'failed to create fallback Personal vault:',
            error
          )
          setToast({
            message: t("Couldn't create a starter vault. Please try again.")
          })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitDisabled = !values.masterPassword || isLoading

  return (
    <Dialog
      title={t('Delete {vaultName}', { vaultName })}
      onClose={handleClose}
      testID="delete-vault-dialog"
      closeButtonTestID="delete-vault-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            data-testid="delete-vault-discard"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="destructive"
            size="small"
            type="button"
            disabled={isSubmitDisabled}
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            data-testid="delete-vault-submit"
          >
            {t('Delete')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="delete-vault-form"
      >
        <Text
          as="p"
          variant="label"
          data-testid="delete-vault-description"
        >
          {t(
            'Are you sure you want to delete "{vaultName}"? All items in this vault will be permanently deleted. This cannot be undone.',
            { vaultName }
          )}
        </Text>

        <PasswordField
          label={t('Confirm With Master Password')}
          placeholder={t('Enter Master Password to Confirm Deletion')}
          {...masterPasswordFieldProps}
          onChange={(e) => {
            onChangeMasterPassword(e.target.value)
            if (submitError) setSubmitError(null)
          }}
          error={masterPasswordError}
          testID="delete-vault-password"
        />

        {showEraseFromAllDevices ? (
          <>
            <div style={styles.eraseRow}>
              <div style={styles.eraseLabel}>
                <Text as="span" variant="label">
                  {t('Erase Vault from all')}
                </Text>
                <span style={styles.eraseLink}>
                  <Link
                    onClick={() => setModal(<PairedDevicesModalContent />)}
                    data-testid="delete-vault-eraseall-link"
                  >
                    {t('{count} devices', { count: deviceCount })}
                  </Link>
                </span>
              </div>
              <ToggleSwitch
                checked={eraseFromAllDevices}
                onChange={setEraseFromAllDevices}
                aria-label={t('Erase vault from all devices')}
                data-testid="delete-vault-eraseall-toggle"
              />
            </div>

            {eraseFromAllDevices ? (
              <AlertMessage
                variant="warning"
                size="small"
                title=""
                description={t(
                  'The removal will take effect on all other devices the next time they access this vault.'
                )}
                testID="delete-vault-eraseall-alert"
              />
            ) : null}
          </>
        ) : null}

        {submitError ? (
          <AlertMessage
            variant="error"
            size="small"
            title=""
            description={submitError}
            testID="delete-vault-error-alert"
          />
        ) : null}
      </Form>
    </Dialog>
  )
}
