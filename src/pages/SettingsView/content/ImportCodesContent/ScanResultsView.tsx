import { useCallback, useRef, useState } from 'react'

import {
  AlertMessage,
  Button,
  ListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { LinkOff, ExpandMore, Link } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useRecords } from '@tetherto/pearpass-lib-vault'

import { RecordItemIcon } from '../../../../components/RecordItemIcon/RecordItemIcon'
import { useTranslation } from '../../../../hooks/useTranslation'
import { getRecordSubtitle } from '../../../../utils/getRecordSubtitle'
import { CodeMatchDropdown } from './CodeMatchDropdown'
import { createStyles } from './ScanResultsView.styles'

type ImportedCode = {
  id: string
  issuer: string
  accountName: string
}

type VaultRecord = {
  id: string
  type: string
  data?: {
    title?: string
    username?: string
    email?: string
    websites?: string[]
  }
}

type CodeMatchEntry = {
  code: ImportedCode
  matchedRecord: VaultRecord | null
}

const MOCK_IMPORTED_CODES: ImportedCode[] = [
  { id: '1', issuer: 'Microsoft 365', accountName: 'simon.j@gmail.com' },
  { id: '2', issuer: 'Slack', accountName: 'acme.1994@gmail.com' },
  { id: '3', issuer: 'GitHub', accountName: 'kristian.k04@zoho.com' },
  { id: '4', issuer: 'Adobe', accountName: 'taylor@gmail.com' },
  { id: '5', issuer: 'Amazon', accountName: 'esme.ee14@outlook.com' },
  { id: '6', issuer: 'Booking.com', accountName: 'simon.j@gmail.com' },
  { id: '7', issuer: 'Kickstarter', accountName: 'simonjtrack@yahoo.com' }
]

type ScanResultsViewProps = {
  onImportComplete: () => void
}

export const ScanResultsView = ({ onImportComplete }: ScanResultsViewProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const [codeMatches, setCodeMatches] = useState<CodeMatchEntry[]>(() =>
    MOCK_IMPORTED_CODES.map((code) => ({ code, matchedRecord: null }))
  )

  const [activeDropdown, setActiveDropdown] = useState<{
    codeId: string
    anchorRect: DOMRect
  } | null>(null)
  const [dropdownSearch, setDropdownSearch] = useState('')

  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())

  const { data: filteredRecords = [] } = useRecords({
    shouldSkip: true,
    variables: {
      filters: { searchPattern: dropdownSearch, type: 'login' },
      sort: { key: 'updatedAt', direction: 'desc' }
    }
  })

  const handleOpenDropdown = useCallback((codeId: string, el: HTMLElement) => {
    setActiveDropdown({ codeId, anchorRect: el.getBoundingClientRect() })
  }, [])

  const handleCloseDropdown = useCallback(() => {
    setActiveDropdown(null)
    setDropdownSearch('')
  }, [])

  const handleLinkRecord = (codeId: string, record: VaultRecord) => {
    setCodeMatches((prev) =>
      prev.map((entry) =>
        entry.code.id === codeId ? { ...entry, matchedRecord: record } : entry
      )
    )
    handleCloseDropdown()
  }

  const handleUnlinkRecord = (codeId: string) => {
    setCodeMatches((prev) =>
      prev.map((entry) =>
        entry.code.id === codeId ? { ...entry, matchedRecord: null } : entry
      )
    )
  }

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
            return (
              <div key={entry.code.id} style={styles.tableRow}>
                <div style={{ ...styles.tableCell1, ...divider }}>
                  <ListItem
                    icon={
                      <RecordItemIcon
                        record={{
                          type: 'login',
                          data: { title: entry.code.issuer }
                        }}
                        size={32}
                      />
                    }
                    iconSize={32}
                    title={entry.code.issuer}
                    subtitle={entry.code.accountName}
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
                      <Button
                        ref={(el) => {
                          if (el)
                            buttonRefs.current.set(
                              `chevron-${entry.code.id}`,
                              el
                            )
                          else
                            buttonRefs.current.delete(
                              `chevron-${entry.code.id}`
                            )
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
                            `chevron-${entry.code.id}`
                          )
                          if (el) handleOpenDropdown(entry.code.id, el)
                        }}
                      />
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
                      onClick={() => handleUnlinkRecord(entry.code.id)}
                      data-testid={`import-codes-unlink-${entry.code.id}`}
                    >
                      {t('Unlink Match')}
                    </Button>
                  ) : (
                    <Button
                      ref={(el) => {
                        if (el)
                          buttonRefs.current.set(`link-${entry.code.id}`, el)
                        else buttonRefs.current.delete(`link-${entry.code.id}`)
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
                        const el = buttonRefs.current.get(
                          `link-${entry.code.id}`
                        )
                        if (el) handleOpenDropdown(entry.code.id, el)
                      }}
                      data-testid={`import-codes-link-${entry.code.id}`}
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
          handleLinkRecord(activeDropdown!.codeId, record)
        }
      />

      <div style={styles.footer}>
        <Button
          variant="primary"
          size="small"
          onClick={onImportComplete}
          data-testid="import-codes-import-button"
        >
          {t('Import Codes')}
        </Button>
      </div>
    </div>
  )
}
