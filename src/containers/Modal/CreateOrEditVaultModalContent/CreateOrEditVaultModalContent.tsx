import React, { useEffect, useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { Button, Dialog, Form, InputField } from '@tetherto/pearpass-lib-ui-kit'
import { useCreateVault, useVault, type Vault } from '@tetherto/pearpass-lib-vault'

import { createStyles } from './CreateOrEditVaultModalContent.styles'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { logger } from '../../../utils/logger'

export type CreateOrEditVaultModalContentProps = {
  onClose: () => void
  onSuccess?: () => void
  vault?: Vault
  shouldRedirectToMain?: boolean
}

export const CreateOrEditVaultModalContent = ({
  onClose,
  onSuccess,
  vault,
  shouldRedirectToMain = true
}: CreateOrEditVaultModalContentProps) => {
  const isEditMode = !!vault
  const { t } = useTranslation()
  const { navigate } = useRouter()
  const styles = createStyles()
  const [isLoading, setIsLoading] = useState(false)

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    name: Validator.string().required(t('Name is required'))
  })

  const { addDevice, updateUnprotectedVault, refetch: refetchVault } = useVault()
  const { createVault } = useCreateVault()

  const { register, handleSubmit, values } = useForm({
    initialValues: {
      name: vault?.name ?? ''
    },
    validate: (formValues: { name: string }) => schema.validate(formValues)
  })

  useEffect(() => {
    if (isEditMode) {
      void refetchVault()
    }
    // TODO: refetchVault ref changes on every vault state update; including it
    //  would re-trigger this effect in an infinite loop.
    //  Make it have stable reference by wrapping in useCallback.
  }, [isEditMode])

  const nameField = register('name')

  const nameOk = values.name.trim().length > 0
  const isSaveDisabled = !nameOk || isLoading

  const submit = async (formValues: { name: string }) => {
    if (isLoading) {
      return
    }

    if (isEditMode && vault) {
      try {
        setIsLoading(true)
        await updateUnprotectedVault(vault.id, { name: formValues.name })
        setIsLoading(false)
        onSuccess?.()
      } catch (error) {
        setIsLoading(false)
        logger.error(
          'CreateOrEditVaultModalContent',
          'Error renaming vault:',
          error
        )
      }
      return
    }

    try {
      setIsLoading(true)

      await createVault({
        name: formValues.name,
        password: ''
      })

      await addDevice()

      onSuccess?.()
      if(shouldRedirectToMain) {
        navigate('vault', { recordType: 'all' })
      }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      logger.error(
        'CreateOrEditVaultModalContent',
        'Error creating vault:',
        error
      )
    }
  }

  const nameError = nameField.error

  return (
    <Dialog
      title={isEditMode ? t('Rename Vault') : t('Create New Vault')}
      onClose={onClose}
      testID="createvault-dialog"
      closeButtonTestID="createvault-close"
      footer={
        <>
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={onClose}
            data-testid="createvault-discard"
          >
            {t('Discard')}
          </Button>
          <Button
            variant="primary"
            size="small"
            type="button"
            disabled={isSaveDisabled}
            isLoading={isLoading}
            onClick={() => handleSubmit(submit)()}
            data-testid="createvault-save"
          >
            {t('Save')}
          </Button>
        </>
      }
    >
      <Form
        onSubmit={handleSubmit(submit)}
        style={styles.form as React.ComponentProps<typeof Form>['style']}
        testID="createvault-form"
      >
        <InputField
          label={t('Vault Name')}
          placeholderText={t('Enter Name')}
          value={nameField.value}
          onChangeText={(v) => nameField.onChange(v)}
          variant={nameError ? 'error' : 'default'}
          errorMessage={nameError || undefined}
          testID="createvault-name"
        />
      </Form>
    </Dialog>
  )
}
