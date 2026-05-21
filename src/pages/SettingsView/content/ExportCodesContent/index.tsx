import React, { useCallback, useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import {
  Button,
  PageHeader,
  PasswordField,
  Radio,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'

import {
  // @ts-expect-error — JS module without type declarations
  exportOtpRecords,
  // @ts-expect-error — JS module without type declarations
  getMasterEncryption,
  useVault
} from '@tetherto/pearpass-lib-vault'

import { AuthenticationModalContent } from '../../../../containers/Modal/AuthenticationModalContent'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { handleExportOtpCsv } from '../../utils/exportOtpCsv'
import { handleExportOtpJson } from '../../utils/exportOtpJson'
import { handleExportOtpQrZip } from '../../utils/exportOtpQrZip'
import { createStyles } from './styles'

type FormValues = {
  password: string
  passwordConfirm: string
}

enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  QR_CODE = 'qr-code'
}

export const ExportCodesContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setToast } = useToast()
  const { setModal, closeModal } = useModal()
  const { data: currentVault, refetch: refetchVault } = useVault()

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(
    ExportFormat.JSON
  )
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const schema = Validator.object({
    password: Validator.string().required(t('Password is required')),
    passwordConfirm: Validator.string().required(t('Password is required'))
  })

  const { register, setErrors, setValue, values } = useForm({
    initialValues: { password: '', passwordConfirm: '' },
    validate: (vals: FormValues) => schema.validate(vals)
  })

  const resetForm = useCallback(() => {
    setValue('password', '')
    setValue('passwordConfirm', '')
    setErrors({})
  }, [setValue, setErrors])

  const handleFormatChange = (value: string) => {
    resetForm()
    setIsPasswordProtected(false)
    setSelectedFormat(value as ExportFormat)
  }

  const handleTogglePasswordProtection = (checked: boolean) => {
    setIsPasswordProtected(checked)
    if (!checked) {
      resetForm()
    }
  }

  const runExport = useCallback(async () => {
    if (isExporting) return

    try {
      setIsExporting(true)
      const vaultId = currentVault?.id
      const currentEncryption = await getMasterEncryption()

      const otpRecords = (await exportOtpRecords()) ?? []
      const vaultsToExport = [
        { name: currentVault?.name ?? '', records: otpRecords }
      ]

      if (selectedFormat === ExportFormat.JSON) {
        await handleExportOtpJson(
          vaultsToExport,
          isPasswordProtected ? values.password : null
        )
      } else if (selectedFormat === ExportFormat.CSV) {
        await handleExportOtpCsv(vaultsToExport)
      } else {
        await handleExportOtpQrZip(vaultsToExport)
      }

      refetchVault(vaultId, currentEncryption)
      resetForm()
      setIsPasswordProtected(false)
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : t('An error occurred while exporting your codes')
      })
    } finally {
      setIsExporting(false)
    }
  }, [
    isExporting,
    selectedFormat,
    isPasswordProtected,
    values.password,
    currentVault,
    refetchVault,
    resetForm,
    setToast,
    t
  ])

  const openAuthModal = () => {
    setModal(
      <AuthenticationModalContent
        onSuccess={async () => {
          closeModal()
          await runExport()
        }}
      />
    )
  }

  const isExportDisabled =
    isExporting ||
    (isPasswordProtected &&
      (!values.password ||
        !values.passwordConfirm ||
        values.password !== values.passwordConfirm))

  const radioOptions = [
    {
      value: ExportFormat.JSON,
      label: t('JSON (Recommended)'),
      description: t(
        'Best for moving your codes to another authenticator app. Preserves all details and relationships.'
      )
    },
    {
      value: ExportFormat.CSV,
      label: t('CSV'),
      description: t(
        'A simple, readable format for reviewing or storing codes outside an app. Some metadata may be lost.'
      )
    },
    {
      value: ExportFormat.QR_CODE,
      label: t('QR Code'),
      description: t(
        'Generate one or more QR codes that can be scanned by another authenticator app. Ideal for quick transfers, especially on mobile.'
      )
    }
  ]

  const passwordFieldsVisible =
    selectedFormat === ExportFormat.JSON && isPasswordProtected
  const passwordsMatch =
    values.password.length > 0 &&
    values.passwordConfirm.length > 0 &&
    values.password === values.passwordConfirm

  const {
    error: passwordError,
    onChange: onChangePassword,
    ...passwordRegisterProps
  } = register('password')
  const {
    error: passwordConfirmError,
    onChange: onChangePasswordConfirm,
    ...passwordConfirmRegisterProps
  } = register('passwordConfirm')

  return (
    <div style={styles.container}>
      <PageHeader
        as="h1"
        title={t('Export')}
        subtitle={t(
          'Export your authenticator codes in a format you can back up or move to another app. You can optionally protect the export with a password for extra security.'
        )}
      />

      <Radio
        options={radioOptions}
        value={selectedFormat}
        onChange={handleFormatChange}
        testID="export-codes-format-radio"
      />

      {selectedFormat === ExportFormat.JSON && (
        <div style={styles.toggleCard}>
          <ToggleSwitch
            checked={isPasswordProtected}
            onChange={handleTogglePasswordProtection}
            label={t('Protect with Password')}
            description={t(
              'Protect your exported file so it can only be opened with the password you set'
            )}
            data-testid="export-codes-protect-toggle"
          />

          <div
            style={{
              ...styles.passwordFieldsWrapper,
              maxHeight: passwordFieldsVisible ? '400px' : '0px',
              opacity: passwordFieldsVisible ? 1 : 0
            }}
          >
            <div style={styles.passwordFields}>
              <PasswordField
                label={t('Password')}
                placeholder={t('Enter File Password')}
                {...passwordRegisterProps}
                onChange={(e) => onChangePassword(e.target.value)}
                error={passwordError ?? undefined}
                testID="export-codes-file-password"
              />
              <PasswordField
                label={t('Repeat Password')}
                placeholder={t('Repeat File Password')}
                {...passwordConfirmRegisterProps}
                onChange={(e) => onChangePasswordConfirm(e.target.value)}
                passwordIndicator={passwordsMatch ? 'match' : undefined}
                error={
                  passwordsMatch
                    ? undefined
                    : (passwordConfirmError ?? undefined)
                }
                testID="export-codes-file-password-confirm"
              />
            </div>
          </div>
        </div>
      )}

      <div style={styles.actionsRow}>
        <Button
          variant="primary"
          size="small"
          type="button"
          disabled={isExportDisabled}
          isLoading={isExporting}
          onClick={openAuthModal}
          data-testid="export-codes-button"
        >
          {t('Export')}
        </Button>
      </div>
    </div>
  )
}
