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
  getMasterEncryption,
  // @ts-expect-error — JS module without type declarations
  getVaultById,
  // @ts-expect-error — JS module without type declarations
  listRecords,
  useVault
} from '@tetherto/pearpass-lib-vault'

import { AuthenticationModalContentV2 } from '../../../../containers/Modal/AuthenticationModalContentV2'
import { useModal } from '../../../../context/ModalContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { handleExportCSVPerVault } from '../../../SettingsView/ExportTab/utils/exportCsvPerVault'
import { handleExportJsonPerVaultTest } from '../../../SettingsView/ExportTab/utils/exportJsonPerVault'
import { createStyles } from './styles'

type FormValues = {
  password: string
  passwordConfirm: string
}

enum ExportFormat {
  JSON = 'json',
  CSV = 'csv'
}

export const ExportItemsContent = () => {
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

  const fetchVaultData = async () => {
    const vaultId = currentVault?.id
    const vault = await getVaultById(vaultId)
    const records = (await listRecords()) ?? []
    return { ...vault, records }
  }

  const handleSubmitExport = useCallback(
    async (encryptionPassword: string | null) => {
      const vaultData = await fetchVaultData()
      const vaultsToExport = [vaultData]

      if (selectedFormat === ExportFormat.JSON) {
        await handleExportJsonPerVaultTest(vaultsToExport, encryptionPassword)
      } else {
        await handleExportCSVPerVault(vaultsToExport)
      }
    },
    [selectedFormat, currentVault]
  )

  const handleExport = useCallback(async () => {
    if (isExporting) return

    try {
      setIsExporting(true)
      const vaultId = currentVault?.id
      const currentEncryption = await getMasterEncryption()

      await handleSubmitExport(isPasswordProtected ? values.password : null)

      refetchVault(vaultId, currentEncryption)

      resetForm()
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : t('An error occurred while exporting your data')
      })
    } finally {
      setIsExporting(false)
    }
  }, [
    isExporting,
    isPasswordProtected,
    values.password,
    currentVault,
    handleSubmitExport,
    refetchVault,
    setToast,
    resetForm,
    t
  ])

  const openAuthModal = () => {
    setModal(
      <AuthenticationModalContentV2
        onSuccess={async () => {
          closeModal()
          await handleExport()
        }}
      />
    )
  }

  const isExportDisabled =
    isPasswordProtected &&
    (!values.password ||
      !values.passwordConfirm ||
      values.password !== values.passwordConfirm)

  const radioOptions = [
    {
      value: ExportFormat.JSON,
      label: t('JSON (Recommended)'),
      description: t(
        'JSON preserves all data, including custom fields and metadata, ensuring a complete export'
      )
    },
    {
      value: ExportFormat.CSV,
      label: t('CSV'),
      description: t(
        'CSV exports basic item data for spreadsheets, without custom fields or metadata.'
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
          'Download the data in the desired format and optionally protect the file with a password for securely backing up or transferring your data.'
        )}
      />

      <Radio
        options={radioOptions}
        value={selectedFormat}
        onChange={handleFormatChange}
        testID="export-format-radio"
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
            data-testid="export-protect-toggle"
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
                testID="export-file-password"
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
                testID="export-file-password-confirm"
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
          onClick={openAuthModal}
          data-testid="export-button"
        >
          {t('Export')}
        </Button>
      </div>
    </div>
  )
}
