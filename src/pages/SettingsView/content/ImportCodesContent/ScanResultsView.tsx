import { useCallback, useMemo, useRef, useState } from 'react'

import type { OTPRecord } from '@tetherto/pearpass-lib-data-import'
import {
  AlertMessage,
  Button,
  ListItem,
  Text,
  rawTokens,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  LinkOff,
  ExpandMore,
  Link,
  ReportProblemRound
} from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  RECORD_TYPES,
  matchLoginRecords,
  useCreateRecord,
  useRecords
} from '@tetherto/pearpass-lib-vault'

import { useToast } from '../../../../context/ToastContext'

import { RecordItemIcon } from '../../../../components/RecordItemIcon/RecordItemIcon'
import { useTranslation } from '../../../../hooks/useTranslation'
import { getRecordSubtitle } from '../../../../utils/getRecordSubtitle'
import { CodeMatchDropdown } from './CodeMatchDropdown'
import { createStyles } from './ScanResultsView.styles'

type VaultRecord = {
  id: string
  type: string
  data?: {
    title?: string
    username?: string
    email?: string
    websites?: string[]
    [key: string]: unknown
  }
}

type CodeMatchEntry = {
  code: OTPRecord
  matchedRecord: VaultRecord | null
}

type ScanResultsViewProps = {
  importedCodes: OTPRecord[]
  onImportComplete: () => void
}

export const ScanResultsView = ({
  importedCodes,
  onImportComplete
}: ScanResultsViewProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { setToast } = useToast()

  const { data: loginRecords = [] } = useRecords({
    variables: { filters: { type: RECORD_TYPES.LOGIN } }
  }) as { data?: VaultRecord[] }

  const initialMatches = useMemo<CodeMatchEntry[]>(
    () =>
      importedCodes.map((code) => {
        const matches = matchLoginRecords(
          { issuer: code.issuer, label: code.label },
          loginRecords
        )
        return {
          code,
          matchedRecord: matches[0]?.record ?? null
        }
      }),
    [importedCodes]
  )

  const [codeMatches, setCodeMatches] =
    useState<CodeMatchEntry[]>(initialMatches)

  const [activeDropdown, setActiveDropdown] = useState<{
    codeIndex: number
    anchorRect: DOMRect
  } | null>(null)
  const [dropdownSearch, setDropdownSearch] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())

  const { data: filteredRecords = [] } = useRecords({
    variables: {
      filters: { searchPattern: dropdownSearch, type: 'login' },
      sort: { key: 'updatedAt', direction: 'desc' }
    }
  }) as { data?: VaultRecord[] }

  const { createRecord } = useCreateRecord()

  const { updateRecords } = useRecords({
    variables: { filters: { type: RECORD_TYPES.LOGIN } }
  }) as {
    updateRecords: (
      records: VaultRecord[],
      onError?: (e: { message: string }) => void
    ) => void
  }

  const handleOpenDropdown = useCallback(
    (codeIndex: number, el: HTMLElement) => {
      setActiveDropdown({ codeIndex, anchorRect: el.getBoundingClientRect() })
    },
    []
  )

  const handleCloseDropdown = useCallback(() => {
    setActiveDropdown(null)
    setDropdownSearch('')
  }, [])

  const handleLinkRecord = (codeIndex: number, record: VaultRecord) => {
    setCodeMatches((prev) =>
      prev.map((entry, i) => {
        if (i === codeIndex) {
          return { ...entry, matchedRecord: record }
        }
        if (entry.matchedRecord?.id === record.id) {
          return { ...entry, matchedRecord: null }
        }
        return entry
      })
    )
    handleCloseDropdown()
  }

  const handleUnlinkRecord = (codeIndex: number) => {
    setCodeMatches((prev) =>
      prev.map((entry, i) =>
        i === codeIndex ? { ...entry, matchedRecord: null } : entry
      )
    )
  }

  const handleImport = async () => {
    setIsImporting(true)
    const onError = (error: { message: string }) => {
      setToast({ message: error.message })
    }

    try {
      await Promise.all(
        codeMatches.map((entry) => {
          const otpInput = entry.code.secret

          if (entry.matchedRecord) {
            return updateRecords(
              [
                {
                  ...entry.matchedRecord,
                  data: {
                    ...(entry.matchedRecord.data ?? {}),
                    otpInput
                  }
                }
              ],
              onError
            )
          }

          return createRecord(
            {
              type: RECORD_TYPES.LOGIN,
              data: {
                title: entry.code.issuer ?? entry.code.label,
                otpInput,
                username: entry.code.label
              }
            },
            onError
          )
        })
      )

      setToast({ message: t('Codes imported successfully') })
      onImportComplete()
    } finally {
      setIsImporting(false)
    }
  }

  const hasOverwrites = codeMatches.some(
    (entry) => entry.matchedRecord && entry.matchedRecord.data?.otpInput
  )

  return (
    <div style={styles.container}>
      <AlertMessage
        variant="info"
        size="medium"
        title={t('Review your imported codes')}
        description={t(
          'Your authenticator codes are ready. We matched them with existing logins to keep related info together and save you time. Nothing is final — review, unlink, or change any match below.'
        )}
        testID="import-codes-scan-results-alert"
      />

      {hasOverwrites && (
        <AlertMessage
          variant="warning"
          size="medium"
          title={t('Some authenticator keys will be overwritten')}
          description={t(
            'One or more matched logins already have a saved authenticator key. Importing will replace them with the new codes.'
          )}
          testID="import-codes-overwrite-warning"
        />
      )}
      <div>
        <div style={styles.tableLabel}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t('Codes Ready to Review')}
          </Text>
        </div>

        <div style={styles.tableOuter}>
          <div style={styles.tableHeaderRow}>
            <div style={styles.tableHeaderCell1}>
              <Text variant="caption" color={theme.colors.colorTextSecondary}>
                {t('Imported Code')}
              </Text>
            </div>
            <div style={styles.tableHeaderCell2}>
              <Text variant="caption" color={theme.colors.colorTextSecondary}>
                {t('Login Match Found')}
              </Text>
            </div>
            <div style={styles.tableHeaderCell3} />
          </div>

          {codeMatches.map((entry, index) => {
            const isLast = index === codeMatches.length - 1
            const divider = isLast ? {} : styles.tableCellRowDivider
            const codeKey = `${index}-${entry.code.label}`
            return (
              <div key={codeKey} style={styles.tableRow}>
                <div style={{ ...styles.tableCell1, ...divider }}>
                  <ListItem
                    icon={
                      <RecordItemIcon
                        record={{
                          type: 'login',
                          data: { title: entry.code.issuer ?? entry.code.label }
                        }}
                        size={32}
                      />
                    }
                    iconSize={32}
                    title={entry.code.issuer ?? entry.code.label}
                    subtitle={entry.code.label}
                  />
                </div>

                <div style={{ ...styles.tableCell2, ...divider }}>
                  <ListItem
                    icon={
                      entry.matchedRecord ? (
                        <RecordItemIcon
                          record={entry.matchedRecord}
                          size={32}
                        />
                      ) : (
                        <div style={styles.noMatchIcon}>
                          <LinkOff
                            width={16}
                            height={16}
                            color={theme.colors.colorTextSecondary}
                          />
                        </div>
                      )
                    }
                    iconSize={32}
                    title={
                      entry.matchedRecord
                        ? (entry.matchedRecord.data?.title ?? '')
                        : t('No Match')
                    }
                    subtitle={
                      entry.matchedRecord
                        ? getRecordSubtitle(entry.matchedRecord)
                        : t('Match or leave it blank')
                    }
                    rightElement={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: `${rawTokens.spacing4}px`
                        }}
                      >
                        {!!entry.matchedRecord?.data?.otpInput && (
                          <ReportProblemRound
                            width={16}
                            height={16}
                            color={theme.colors.colorSurfaceWarning}
                          />
                        )}
                        <Button
                          ref={(el) => {
                            if (el)
                              buttonRefs.current.set(`chevron-${codeKey}`, el)
                            else buttonRefs.current.delete(`chevron-${codeKey}`)
                          }}
                          aria-label={t('Change Match')}
                          variant="tertiary"
                          size="small"
                          iconBefore={
                            <ExpandMore
                              width={16}
                              height={16}
                              color={theme.colors.colorTextSecondary}
                            />
                          }
                          onClick={() => {
                            const el = buttonRefs.current.get(
                              `chevron-${codeKey}`
                            )
                            if (el) handleOpenDropdown(index, el)
                          }}
                        />
                      </div>
                    }
                  />
                </div>

                <div style={{ ...styles.tableCell3, ...divider }}>
                  {entry.matchedRecord ? (
                    <Button
                      variant="secondary"
                      size="small"
                      iconBefore={
                        <LinkOff
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      }
                      onClick={() => handleUnlinkRecord(index)}
                      data-testid={`import-codes-unlink-${codeKey}`}
                    >
                      {t('Unlink Match')}
                    </Button>
                  ) : (
                    <Button
                      ref={(el) => {
                        if (el) buttonRefs.current.set(`link-${codeKey}`, el)
                        else buttonRefs.current.delete(`link-${codeKey}`)
                      }}
                      variant="secondary"
                      size="small"
                      iconBefore={
                        <Link
                          width={16}
                          height={16}
                          color={theme.colors.colorTextPrimary}
                        />
                      }
                      onClick={() => {
                        const el = buttonRefs.current.get(`link-${codeKey}`)
                        if (el) handleOpenDropdown(index, el)
                      }}
                      data-testid={`import-codes-link-${codeKey}`}
                    >
                      {t('Link Manually')}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <CodeMatchDropdown
        open={activeDropdown !== null}
        anchorRect={activeDropdown?.anchorRect ?? null}
        onClose={handleCloseDropdown}
        dropdownSearch={dropdownSearch}
        onSearchChange={setDropdownSearch}
        records={filteredRecords}
        onSelectRecord={(record) =>
          handleLinkRecord(activeDropdown!.codeIndex, record)
        }
      />

      <div style={styles.footer}>
        <Button
          variant="primary"
          size="small"
          isLoading={isImporting}
          disabled={isImporting}
          onClick={handleImport}
          data-testid="import-codes-import-button"
        >
          {t('Import Codes')}
        </Button>
      </div>
    </div>
  )
}
