import React, { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  Button,
  Dialog,
  Form,
  PasswordField,
  Text
} from '@tetherto/pearpass-lib-ui-kit'
import { KeyboardArrowRightRound } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useUserData } from '@tetherto/pearpass-lib-vault'
import {
  clearBuffer,
  stringToBuffer
} from '@tetherto/pearpass-lib-vault/src/utils/buffer'

import { useGlobalLoading } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { createStyles } from './styles'

export type AuthenticationModalContentProps = {
  open?: boolean
  onClose?: () => void
  onSuccess?: (password: Uint8Array) => Promise<void>
  onError?: (
    error: unknown,
    setErrors: (errors: Record<string, string>) => void
  ) => Promise<void>
}

export const AuthenticationModalContent = ({
  open,
  onClose,
  onSuccess,
  onError
}: AuthenticationModalContentProps) => {
  const styles = createStyles()
  const { t } = useTranslation()
  const { closeModal } = useModal()

  const handleClose = onClose ?? closeModal

  const [isLoading, setIsLoading] = useState(false)

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    password: Validator.string().required(t('Password is required'))
  })

  const { logIn } = useUserData()

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: { password: '' },
    validate: (values: { password: string }) => schema.validate(values)
  })

  const onSubmit = async (values: { password: string }) => {
    if (isLoading) {
      return
    }

    if (!values.password) {
      setErrors({ password: t('Password is required') })
      return
    }

    const passwordBuffer = stringToBuffer(values.password)

    try {
      setIsLoading(true)
      await logIn({ password: passwordBuffer })
      await onSuccess?.(passwordBuffer)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)

      if (onError) {
        await onError(error, setErrors)
      } else {
        setErrors({ password: t('Invalid password') })
      }
    } finally {
      clearBuffer(passwordBuffer)
    }
  }

  const { onChange: onChangePassword, ...passwordFieldProps } =
    register('password')

  return (
    <Dialog
      title={t('Verification Required')}
      open={open}
      onClose={handleClose}
      testID="authentication-dialog"
      closeButtonTestID="authentication-close"
      footer={
        <Button
          variant="primary"
          size="small"
          type="button"
          isLoading={isLoading}
          iconAfter={<KeyboardArrowRightRound />}
          onClick={() => handleSubmit(onSubmit)()}
          data-testid="authentication-continue"
        >
          {t('Continue')}
        </Button>
      }
    >
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={styles.container as React.ComponentProps<typeof Form>['style']}
        testID="authentication-form"
      >
        <Text as="p" variant="body" data-testid="authentication-description">
          {t('Use your Master Password to authorize this action.')}
        </Text>

        <PasswordField
          label={t('Password')}
          placeholder={t('Enter Master Password')}
          {...passwordFieldProps}
          onChange={(e) => onChangePassword(e.target.value)}
          error={passwordFieldProps.error || undefined}
          testID="authentication-password"
        />
      </Form>
    </Dialog>
  )
}
