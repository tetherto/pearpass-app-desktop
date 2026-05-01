import { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { MAX_IMPORT_RECORDS } from '@tetherto/pearpass-lib-constants'
import {
  decryptKeePassKdbx,
  parse1PasswordData,
  parseBitwardenData,
  parseKeePassData,
  parseLastPassData,
  parseNordPassData,
  parsePearPassData,
  parseProtonPassData
} from '@tetherto/pearpass-lib-data-import'
import type { UploadedFile } from '@tetherto/pearpass-lib-ui-kit'
import {
  Button,
  Link,
  ListItem,
  PageHeader,
  PasswordField,
  Text,
  Title,
  UploadField,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ArrowBackOutined,
  KeyboardArrowRightFilled
} from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  decryptExportData,
  useCreateRecord
} from '@tetherto/pearpass-lib-vault'

import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useToast } from '../../../../context/ToastContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { logger } from '../../../../utils/logger'
import { readFileContent } from '../../../SettingsView/ImportTab/utils/readFileContent'
import { createStyles } from './styles'

type ImportState = 'default' | 'upload' | 'inputPassword'

type ImportOption = {
  title: string
  type: ImportOptionType
  description: string
  testId?: string
  accepts: string[]
  supportLink?: string
  learnMoreUrl?: string
}

type FileInfo = {
  fileContent: string | ArrayBuffer
  fileType: string
  filename: string
  size: number
  isEncrypted: boolean
}

enum ImportOptionType {
  OnePassword = '1password',
  Bitwarden = 'bitwarden',
  KeePass = 'keepass',
  KeePassKDBX = 'keepass-kdbx',
  LastPass = 'lastpass',
  NordPass = 'nordpass',
  ProtonPass = 'protonpass',
  Unencrypted = 'unencrypted',
  Encrypted = 'encrypted'
}

const isAllowedType = (fileType: string, accepts: string[]) =>
  accepts.some((accept) => {
    if (accept.startsWith('.')) {
      return fileType === accept.slice(1)
    }
    return fileType === accept
  })

export const ImportItemsContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setToast } = useToast()
  const { createRecord } = useCreateRecord()

  const importOptions: ImportOption[] = [
    {
      title: '1Password',
      type: ImportOptionType.OnePassword,
      description: t(
        'To import data from 1Password, open the app, go to File > Export, and export your data as a CSV file. Once the export is complete, upload the file here.'
      ),
      testId: 'settings-import-1password',
      accepts: ['.csv'],
      supportLink: 'https://support.1password.com/export'
    },
    {
      title: 'Bitwarden',
      type: ImportOptionType.Bitwarden,
      description: t(
        'To import data from Bitwarden, go to Tools > Export Vault in the web app, choose JSON or CSV format, and upload the exported file here.'
      ),
      testId: 'settings-import-bitwarden',
      accepts: ['.json', '.csv'],
      supportLink: 'https://bitwarden.com/help/export-your-data/'
    },
    {
      title: 'KeePass',
      type: ImportOptionType.KeePass,
      description: t(
        'To import data from KeePass, open your database and export it via File > Export. KDBX files require your database password. Upload the exported file here.'
      ),
      testId: 'settings-import-keepass',
      accepts: ['.kdbx', '.csv', '.xml'],
      supportLink: 'https://keepass.info/help/base/importexport.html'
    },
    {
      title: 'KeePassXC',
      type: ImportOptionType.KeePass,
      description: t(
        'To import data from KeePassXC, open your database and go to Database > Export to CSV or XML. Once done, upload the exported file here.'
      ),
      testId: 'settings-import-keepassxc',
      accepts: ['.csv', '.xml'],
      supportLink:
        'https://keepassxc.org/docs/KeePassXC_UserGuide#_exporting_databases'
    },
    {
      title: 'LastPass',
      type: ImportOptionType.LastPass,
      description: t(
        'To import data from LastPass, go to Advanced Options > Export in your LastPass vault. Export as CSV and upload the file here.'
      ),
      testId: 'settings-import-lastpass',
      accepts: ['.csv'],
      supportLink:
        'https://support.lastpass.com/s/document-item?language=en_US&bundleId=lastpass&topicId=LastPass/export-web-vault.html&_LANG=enus'
    },
    {
      title: 'NordPass',
      type: ImportOptionType.NordPass,
      description: t(
        'To import data from NordPass, open the app, go to Settings > Import & Export, and export your data as CSV. Upload the exported file here.'
      ),
      testId: 'settings-import-nordpass',
      accepts: ['.csv'],
      supportLink:
        'https://support.nordpass.com/hc/en-us/articles/360007646477-How-to-export-passwords-from-NordPass'
    },
    {
      title: 'Proton Pass',
      type: ImportOptionType.ProtonPass,
      description: t(
        'To import data from Proton Pass, open the app, go to Settings, navigate to the Export tab, and choose your preferred export format. Once the export is complete, upload the file here.'
      ),
      testId: 'settings-import-protonpass',
      accepts: ['.csv', '.json'],
      supportLink: 'https://proton.me/support/pass-export'
    },
    {
      title: 'PearPass Encrypted File',
      type: ImportOptionType.Encrypted,
      description: t(
        'Upload a PearPass-encrypted JSON export file. You will need the password used to encrypt the file.'
      ),
      accepts: ['.json'],
      supportLink:
        'https://docs.pass.pears.com/how-to-guides/how-to-export-your-vault/'
    },
    {
      title: 'PearPass Unencrypted File',
      type: ImportOptionType.Unencrypted,
      description: t(
        'Upload an unencrypted PearPass export file in JSON or CSV format.'
      ),
      testId: 'settings-import-unencrypted',
      accepts: ['.json', '.csv'],
      supportLink:
        'https://docs.pass.pears.com/how-to-guides/how-to-export-your-vault/'
    }
  ]

  const [state, setState] = useState<ImportState>('default')
  const [selectedOption, setSelectedOption] = useState<ImportOption | null>(
    null
  )
  const [selectedFileInfo, setSelectedFileInfo] = useState<FileInfo | null>(
    null
  )
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isImporting, setIsImporting] = useState(false)

  useGlobalLoading({ isLoading: isImporting })

  const schema = Validator.object({
    password: Validator.string().required(t('Password is required'))
  })

  const { register, handleSubmit, setErrors, setValues, values } = useForm({
    initialValues: { password: '' },
    validate: (vals: { password: string }) => schema.validate(vals)
  })

  const onError = (error: Error) => {
    setToast({ message: error.message })
  }

  const importRecords = async (result: unknown[]) => {
    if (result.length === 0) {
      setToast({ message: t('No records found to import!') })
      return
    }

    if (result.length > MAX_IMPORT_RECORDS) {
      setToast({
        message: t(`Too many records. Maximum is ${MAX_IMPORT_RECORDS}.`)
      })
      return
    }

    const BATCH_SIZE = 100
    const totalRecords = result.length

    for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
      const batch = result.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map((record) => createRecord(record, onError)))
    }

    setToast({ message: t('Data imported successfully') })
  }

  const onImport = async ({
    type,
    fileContent,
    fileType,
    password,
    isEncrypted
  }: {
    type: ImportOptionType
    fileContent: string | ArrayBuffer
    fileType: string
    password?: string | null
    isEncrypted?: boolean
  }) => {
    let result: unknown[] = []
    let dataToProcess: unknown = fileContent
    let resolvedType = type

    try {
      if (
        (resolvedType === ImportOptionType.KeePass ||
          resolvedType === ImportOptionType.KeePassKDBX) &&
        fileType === 'kdbx'
      ) {
        if (!password) {
          throw new Error('Password is required for encrypted files')
        }
        dataToProcess = await decryptKeePassKdbx(fileContent, password)
        resolvedType = ImportOptionType.KeePassKDBX
      }

      if (resolvedType === ImportOptionType.Encrypted && isEncrypted) {
        if (!password) {
          throw new Error('Password is required for encrypted files')
        }
        const encryptedData = JSON.parse(fileContent as string)
        dataToProcess = await decryptExportData(encryptedData, password)
      }
    } catch {
      throw new Error(
        'Failed to decrypt file. Please check your password and try again.'
      )
    }

    try {
      switch (resolvedType) {
        case ImportOptionType.OnePassword:
          result = await parse1PasswordData(dataToProcess, fileType)
          break
        case ImportOptionType.Bitwarden:
          result = await parseBitwardenData(dataToProcess, fileType)
          break
        case ImportOptionType.LastPass:
          result = await parseLastPassData(dataToProcess, fileType)
          break
        case ImportOptionType.KeePass:
          result = await parseKeePassData(dataToProcess, fileType)
          break
        case ImportOptionType.KeePassKDBX:
          result = await parseKeePassData(dataToProcess, 'kdbx')
          break
        case ImportOptionType.NordPass:
          result = await parseNordPassData(dataToProcess, fileType)
          break
        case ImportOptionType.ProtonPass:
          result = await parseProtonPassData(dataToProcess, fileType)
          break
        case ImportOptionType.Unencrypted:
          result = await parsePearPassData(dataToProcess, fileType)
          break
        case ImportOptionType.Encrypted:
          result = await parsePearPassData(dataToProcess, 'json')
          break
        default:
          throw new Error(
            'Unsupported template type. Please select a valid import option.'
          )
      }

      await importRecords(result)
    } catch (error) {
      throw new Error(
        (error instanceof Error ? error.message : null) ||
          'Failed to parse file. Please ensure it is valid.'
      )
    }
  }

  const resetToDefault = () => {
    setState('default')
    setSelectedOption(null)
    setSelectedFileInfo(null)
    setFiles([])
    setValues({ password: '' })
  }

  const handleBack = () => {
    if (state === 'inputPassword') {
      setState('upload')
      setValues({ password: '' })
    } else if (state === 'upload') {
      resetToDefault()
    }
  }

  const handleFilesChange = async (newFiles: UploadedFile[]) => {
    setFiles(newFiles)

    if (newFiles.length === 0) {
      setSelectedFileInfo(null)
      return
    }

    if (!selectedOption) return

    const uploadedFile = newFiles[0]
    const file = uploadedFile.file
    if (!file) return

    const filename = file.name
    const fileType = filename.split('.').pop() ?? ''

    if (!isAllowedType(fileType, selectedOption.accepts)) {
      setToast({ message: t('Invalid file type') })
      setFiles([])
      setSelectedFileInfo(null)
      return
    }

    try {
      if (
        selectedOption.type === ImportOptionType.KeePass &&
        fileType === 'kdbx'
      ) {
        const fileContent = await readFileContent(file, { as: 'buffer' })
        setSelectedFileInfo({
          fileContent,
          fileType,
          filename,
          size: file.size,
          isEncrypted: true
        })
        return
      }

      if (selectedOption.type === ImportOptionType.Encrypted) {
        const fileContent = await readFileContent(file)
        setSelectedFileInfo({
          fileContent,
          fileType,
          filename,
          size: file.size,
          isEncrypted: true
        })
        return
      }

      const fileContent = await readFileContent(file)
      setSelectedFileInfo({
        fileContent,
        fileType,
        filename,
        size: file.size,
        isEncrypted: false
      })
    } catch (error) {
      setToast({ message: t('Failed to read file') })
      logger.error('ImportItemsContent', 'Error reading file:', error)
      setFiles([])
      setSelectedFileInfo(null)
    }
  }

  const handleImport = async (formValues?: { password: string }) => {
    if (!selectedOption || !selectedFileInfo) return

    setIsImporting(true)
    try {
      await onImport({
        type: selectedOption.type,
        fileContent: selectedFileInfo.fileContent,
        fileType: selectedFileInfo.fileType,
        password: formValues?.password ?? null,
        isEncrypted: selectedFileInfo.isEncrypted
      })
      resetToDefault()
    } catch (error) {
      if (state === 'inputPassword') {
        setErrors({
          password:
            error instanceof Error
              ? error.message
              : t(
                  "The password entered doesn't match the one used to encrypt your file."
                )
        })
      } else {
        setToast({
          message:
            error instanceof Error
              ? error.message
              : t('Import failed. Please try again.')
        })
      }
    } finally {
      setIsImporting(false)
    }
  }

  const handleContinue = () => {
    if (!selectedFileInfo) return
    if (selectedFileInfo.isEncrypted) {
      setState('inputPassword')
    } else {
      void handleImport()
    }
  }

  const { onChange: onChangePassword, ...passwordProps } = register('password')

  return (
    <div style={styles.container}>
      {state === 'default' && (
        <>
          <PageHeader
            as="h1"
            title={t('Import Items')}
            subtitle={t(
              'Easily import your passwords and data from other password managers. Select your source, upload the exported file, and follow the prompts to get your data into PearPass.'
            )}
          />

          <div style={styles.listWrapper}>
            <Text color={theme.colors.colorTextSecondary} variant="caption">
              {t('Select Import Source')}
            </Text>

            <div style={styles.listItems}>
              {importOptions.map((option, index) => (
                <div
                  key={option.title}
                  style={
                    index < importOptions.length - 1
                      ? styles.listItemBorder
                      : undefined
                  }
                >
                  <ListItem
                    key={option.title}
                    title={option.title}
                    subtitle={
                      t('Required Format:') +
                      ' ' +
                      option.accepts.join(', ').toUpperCase()
                    }
                    testID={option.testId}
                    rightElement={
                      <KeyboardArrowRightFilled
                        width={16}
                        height={16}
                        color={theme.colors.colorTextPrimary}
                      />
                    }
                    onClick={() => {
                      setSelectedOption(option)
                      setSelectedFileInfo(null)
                      setFiles([])
                      setState('upload')
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {(state === 'upload' || state === 'inputPassword') && selectedOption && (
        <>
          <div style={styles.backButton}>
            <Button
              size="small"
              variant="tertiary"
              iconBefore={
                <ArrowBackOutined color={theme.colors.colorTextPrimary} />
              }
              onClick={handleBack}
              aria-label={t('back')}
            />
            <Text>{t('Back')}</Text>
          </div>

          <div style={styles.header}>
            <Title as="h2">
              {t('Import from')} {selectedOption.title}
            </Title>
            <Text color={theme.colors.colorTextSecondary} as="p">
              {selectedOption.description}
              {selectedOption.supportLink && (
                <>
                  {' '}
                  {t('Additionally,')}{' '}
                  <Link
                    onClick={() =>
                      window.electronAPI?.openExternal(
                        selectedOption.supportLink!
                      )
                    }
                  >
                    {t(
                      `Learn more about exporting data from ${selectedOption.title}`
                    )}
                  </Link>
                  {'.'}
                </>
              )}
            </Text>
          </div>

          {state === 'inputPassword' ? (
            <div style={styles.passwordSection}>
              <PasswordField
                label={t('File Password')}
                placeholder={t('Enter File Password')}
                {...passwordProps}
                onChange={(e) => onChangePassword(e.target.value)}
                testID="import-file-password-field"
              />
              <Text color={theme.colors.colorTextSecondary} variant="caption">
                {t(
                  'The uploaded file is encrypted. Enter the password to continue.'
                )}
              </Text>
            </div>
          ) : (
            <div style={styles.uploadArea}>
              <UploadField
                acceptedFormats={selectedOption.accepts}
                files={files}
                onFilesChange={handleFilesChange}
                uploadLinkText={t('Upload file')}
                uploadSuffixText={t('or drag and drop it here')}
                formatsPrefix={t('Required Format:')}
                testID="import-upload-field"
              />
            </div>
          )}

          <div style={styles.footer}>
            {state === 'inputPassword' ? (
              <Button
                variant="primary"
                size="small"
                disabled={!values.password || isImporting}
                isLoading={isImporting}
                onClick={handleSubmit(handleImport)}
              >
                {t('Continue')}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="small"
                disabled={!selectedFileInfo || isImporting}
                isLoading={isImporting}
                onClick={handleContinue}
              >
                {t('Import')}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
