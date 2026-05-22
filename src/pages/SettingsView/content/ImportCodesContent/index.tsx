import { useState } from 'react'

import type {
  OTPRecord,
  NormalizeResult
} from '@tetherto/pearpass-lib-data-import'
import { normalizeImport } from '@tetherto/pearpass-lib-data-import'
import type { UploadedFile } from '@tetherto/pearpass-lib-ui-kit'
import {
  AlertMessage,
  Button,
  Link,
  ListItem,
  PageHeader,
  Text,
  Title,
  UploadField,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ArrowBackOutined,
  KeyboardArrowRightFilled
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { decodeQrFromImage } from '../../../../features/qr-decoder/decodeQrFromImage'
import { useTranslation } from '../../../../hooks/useTranslation'
import { ScanResultsView } from './ScanResultsView'
import { createStyles } from './styles'

type ImportCodesState = 'default' | 'upload'

type ImportCodesOption = {
  title: string
  description: string
  learnMoreUrl?: string
  accepts: string[]
  multiFile?: boolean
  testID?: string
}

const importCodesOptions: ImportCodesOption[] = [
  {
    title: 'Google Authenticator',
    description:
      'To import your codes, open Google Authenticator, tap the menu, go to Transfer accounts, and select Export accounts. Once the export is complete, one or more QR codes will be generated that you can upload here.',
    learnMoreUrl: 'https://support.google.com/accounts/answer/1066447',
    accepts: ['.png', '.jpg', '.jpeg'],
    multiFile: true,
    testID: 'settings-import-codes-google-authenticator'
  }
]

export const ImportCodesContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const [state, setState] = useState<ImportCodesState>('default')
  const [selectedOption, setSelectedOption] =
    useState<ImportCodesOption | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isScanned, setIsScanned] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [importedCodes, setImportedCodes] = useState<OTPRecord[]>([])
  const [importError, setImportError] = useState<string | null>(null)

  const resetToDefault = () => {
    setState('default')
    setSelectedOption(null)
    setFiles([])
    setIsScanned(false)
    setIsScanning(false)
    setImportedCodes([])
    setImportError(null)
  }

  const handleBack = () => {
    resetToDefault()
  }

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles)
    if (isScanned && newFiles.length < files.length) {
      setIsScanned(false)
      setImportedCodes([])
      setImportError(null)
    }
  }

  const handleScanFiles = async () => {
    if (!selectedOption || files.length === 0) return

    setIsScanning(true)
    setImportError(null)

    try {
      const decoded: string[] = await Promise.all(
        files.map((f) => decodeQrFromImage(f.file))
      )

      const result: NormalizeResult = normalizeImport(decoded)

      if (result.status === 'incomplete-batch') {
        setImportError(
          t(
            'To finish your export, please upload all required QR codes. ({received} currently uploaded)',
            {
              received: result.received
            }
          )
        )
        return
      }

      setImportedCodes(result.records)
      setIsScanned(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setImportError(message)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div style={styles.container}>
      {state === 'default' && (
        <>
          <PageHeader
            as="h1"
            title={t('Import')}
            subtitle={t(
              'To import data from another authenticator, first access the authenticator, export your data, and then upload the exported file into the designated field'
            )}
          />

          <div style={styles.listWrapper}>
            <Text color={theme.colors.colorTextSecondary} variant="caption">
              {t('Select Import Source')}
            </Text>

            <div style={styles.listItems}>
              {importCodesOptions.map((option, index) => (
                <div
                  key={option.title}
                  style={
                    index < importCodesOptions.length - 1
                      ? styles.listItemBorder
                      : undefined
                  }
                >
                  <ListItem
                    title={option.title}
                    subtitle={t('Required Format: {format}', {
                      format: option.accepts
                        .join(', ')
                        .replace(/\./g, '')
                        .toUpperCase()
                    })}
                    testID={option.testID}
                    rightElement={
                      <KeyboardArrowRightFilled
                        width={16}
                        height={16}
                        color={theme.colors.colorTextPrimary}
                      />
                    }
                    onClick={() => {
                      setSelectedOption(option)
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

      {state === 'upload' && selectedOption && (
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
              {selectedOption.learnMoreUrl && (
                <>
                  {' '}
                  {t('Additionally,')}{' '}
                  <Link
                    onClick={() =>
                      window.electronAPI?.openExternal(
                        selectedOption.learnMoreUrl!
                      )
                    }
                  >
                    {t(
                      `Learn more about exporting codes from ${selectedOption.title}`
                    )}
                  </Link>
                  {'.'}
                </>
              )}
            </Text>
          </div>

          <div style={styles.uploadArea}>
            <UploadField
              acceptedFormats={selectedOption.accepts}
              maxFiles={selectedOption.multiFile ? 0 : 1}
              files={files}
              onFilesChange={handleFilesChange}
              uploadLinkText={t('Upload file')}
              uploadSuffixText={t('or drag and drop it here')}
              formatsPrefix={t('Required Format:')}
              testID="import-codes-upload-field"
            />
          </div>

          {importError && (
            <AlertMessage
              title=""
              variant="error"
              size="small"
              description={importError}
              testID="import-codes-scan-error"
            />
          )}

          <div style={styles.footer}>
            <Button
              variant="primary"
              size="small"
              disabled={files.length === 0 || isScanning}
              isLoading={isScanning}
              onClick={handleScanFiles}
              data-testid="import-codes-scan-file-button"
            >
              {t('Scan File')}
            </Button>
          </div>

          {isScanned && (
            <ScanResultsView
              importedCodes={importedCodes}
              onImportComplete={resetToDefault}
            />
          )}
        </>
      )}
    </div>
  )
}
