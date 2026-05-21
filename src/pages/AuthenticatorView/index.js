import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLingui } from '@lingui/react'
import { DESKTOP_2FA_IMPORTS_ENABLED } from '@tetherto/pearpass-lib-constants'
import {
  Breadcrumb,
  Button,
  ContextMenu,
  ListItem,
  NavbarListItem,
  Text,
  Title,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  Add,
  CalendarToday,
  Check,
  Checklist,
  ContentCopy,
  FilterList,
  ImportExport,
  SortByAlpha
} from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  formatOtpCode,
  groupOtpRecords,
  isExpiring,
  RECORD_TYPES,
  useFolders,
  useRecords
} from '@tetherto/pearpass-lib-vault'
import { html } from 'htm/react'

import { createStyles } from './styles'
import { RecordItemIcon } from '../../components/RecordItemIcon'
import { TimerCircle } from '../../components/TimerCircle'
import { SORT_BY_TYPE, SORT_KEYS } from '../../constants/sortOptions'
import {
  ILLUSTRATION_HEIGHT,
  createStyles as createEmptyStateStyles
} from '../../containers/EmptyCollectionView/EmptyCollectionView.styles'
import { EmptyResultsView } from '../../containers/EmptyResultsView'
import { DeleteRecordsModalContent } from '../../containers/Modal/DeleteRecordsModalContent'
import { MoveFolderModalContent } from '../../containers/Modal/MoveFolderModalContent/MoveFolderModalContent'
import { MultiSelectActionsBar } from '../../containers/MultiSelectActionsBar'
import { createStyles as createListStyles } from '../../containers/RecordListView/RecordListView.styles'
import { useAppHeaderContext } from '../../context/AppHeaderContext'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.electron'
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'
import { SettingsItemKey } from '../../pages/SettingsView/SettingsView'
import { ItemCardIllustration } from '../../svgs/ItemCardIllustration'
import { getRecordSubtitle } from '../../utils/getRecordSubtitle'

const SORT_MENU_WIDTH = 260

export const AuthenticatorView = () => {
  const { i18n } = useLingui()
  const { theme } = useTheme()
  const { navigate, data: routeData } = useRouter()
  const { setModal, isOpen: isModalOpen } = useModal()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const { searchValue } = useAppHeaderContext()
  const { copyToClipboard } = useCopyToClipboard()
  const styles = createStyles(theme.colors)
  const emptyStateStyles = createEmptyStateStyles()
  const listStyles = createListStyles(theme.colors)

  const [sortKey, setSortKey] = useState(SORT_KEYS.LAST_UPDATED_NEWEST)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isMultiSelectOn, setIsMultiSelectOn] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState([])

  const sort = useMemo(() => SORT_BY_TYPE[sortKey], [sortKey])

  const { data: records, updateFavoriteState } = useRecords({
    shouldSkip: true,
    variables: {
      filters: {
        hasOtp: true,
        searchPattern: searchValue
      },
      sort
    }
  })

  const otpRecords = useMemo(
    () => (records || []).filter((r) => r.otpPublic),
    [records]
  )

  const { totpGroups, hotpRecords } = useMemo(
    () => groupOtpRecords(otpRecords),
    [otpRecords]
  )

  const selectedRecordsSet = useMemo(
    () => new Set(selectedRecords),
    [selectedRecords]
  )

  const selectedRecordObjects = useMemo(() => {
    if (!records?.length || !selectedRecords.length) return []
    const ids = new Set(selectedRecords)
    return records.filter((r) => ids.has(r.id))
  }, [records, selectedRecords])

  const selectedCount = selectedRecordObjects.length
  const allSelectedFavorited =
    selectedCount > 0 && selectedRecordObjects.every((r) => !!r.isFavorite)

  const { data: foldersData } = useFolders()
  const hasCustomFolders =
    Object.keys(foldersData?.customFolders ?? {}).length > 0

  useEffect(() => {
    if (!isMultiSelectOn) setSelectedRecords([])
  }, [isMultiSelectOn])

  useEffect(() => {
    setIsMultiSelectOn(false)
  }, [searchValue])

  const exitMultiSelect = useCallback(() => {
    setSelectedRecords([])
    setIsMultiSelectOn(false)
  }, [])

  useEffect(() => {
    if (!isMultiSelectOn || isModalOpen) return
    const handler = (event) => {
      if (event.key === 'Escape') exitMultiSelect()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isMultiSelectOn, isModalOpen, exitMultiSelect])

  const handleRecordPress = useCallback(
    (record) => {
      if (isMultiSelectOn) {
        setSelectedRecords((prev) =>
          prev.includes(record.id)
            ? prev.filter((id) => id !== record.id)
            : [...prev, record.id]
        )
        return
      }
      const isAlreadyOpen = routeData?.recordId === record.id
      navigate('vault', {
        recordId: isAlreadyOpen ? '' : record.id,
        recordType: RECORD_TYPES.OTP
      })
    },
    [isMultiSelectOn, navigate, routeData?.recordId]
  )

  const handleMove = () => {
    if (!selectedCount) return
    setModal(
      html`<${MoveFolderModalContent}
        records=${selectedRecordObjects}
        onCompleted=${exitMultiSelect}
      />`
    )
  }

  const handleDelete = () => {
    if (!selectedCount) return
    setModal(
      html`<${DeleteRecordsModalContent}
        records=${selectedRecordObjects}
        onCompleted=${exitMultiSelect}
      />`
    )
  }

  const handleToggleFavorite = async () => {
    if (!selectedCount) return
    await updateFavoriteState(selectedRecords, !allSelectedFavorited)
    exitMultiSelect()
  }

  const sortOptions = useMemo(
    () => [
      {
        key: SORT_KEYS.TITLE_AZ,
        label: i18n._('Title (A-Z)'),
        Icon: SortByAlpha
      },
      {
        key: SORT_KEYS.LAST_UPDATED_NEWEST,
        label: i18n._('Last Updated (Newest first)'),
        Icon: CalendarToday
      },
      {
        key: SORT_KEYS.LAST_UPDATED_OLDEST,
        label: i18n._('Last Updated (Oldest first)'),
        Icon: CalendarToday
      },
      {
        key: SORT_KEYS.DATE_ADDED_NEWEST,
        label: i18n._('Date Added (Newest first)'),
        Icon: CalendarToday
      },
      {
        key: SORT_KEYS.DATE_ADDED_OLDEST,
        label: i18n._('Date Added (Oldest first)'),
        Icon: CalendarToday
      }
    ],
    [i18n]
  )

  const handleSelectSort = (key) => {
    setSortKey(key)
    setIsSortOpen(false)
  }

  const iconColor = theme.colors.colorTextPrimary

  const renderRecordRow = (record) => {
    const code = record.otpPublic?.currentCode ?? null
    const isSelected = selectedRecordsSet.has(record.id)
    return html`
      <${ListItem}
        key=${record.id}
        icon=${html`<${RecordItemIcon} record=${record} />`}
        iconSize=${32}
        title=${record.data?.title ?? ''}
        subtitle=${getRecordSubtitle(record) || undefined}
        selectionMode=${isMultiSelectOn ? 'multi' : 'none'}
        isSelected=${isSelected}
        onSelect=${() => handleRecordPress(record)}
        onClick=${() => handleRecordPress(record)}
        testID=${`authenticator-record-item-${record.id}`}
        style=${listStyles.recordRow}
        rightElement=${!isMultiSelectOn
          ? html`
              <div style=${listStyles.rowRightElement}>
                <${Text} variant="labelEmphasized"> ${formatOtpCode(code)} <//>
                <${Button}
                  variant="tertiary"
                  size="small"
                  data-testid=${`authenticator-record-copy-${record.id}`}
                  aria-label=${i18n._('Copy code')}
                  iconBefore=${html`<${ContentCopy} color=${iconColor} />`}
                  onClick=${(event) => {
                    event.stopPropagation()
                    if (code) copyToClipboard(code)
                  }}
                />
              </div>
            `
          : undefined}
      />
    `
  }

  return html`
    <div style=${styles.wrapper}>
      <div style=${styles.headerContainer}>
        <div style=${styles.breadcrumbWrapper}>
          <${Breadcrumb}
            items=${[i18n._('Authenticator')]}
            actions=${html`
              <div style=${styles.headerActions}>
                <${Button}
                  variant="tertiary"
                  size="small"
                  data-testid="authenticator-header-multi-select"
                  aria-label=${isMultiSelectOn
                    ? i18n._('Exit multi-select')
                    : i18n._('Toggle multi-select')}
                  aria-pressed=${isMultiSelectOn}
                  onClick=${() => setIsMultiSelectOn(!isMultiSelectOn)}
                  iconBefore=${html`<${Checklist} color=${iconColor} />`}
                />
                <${ContextMenu}
                  open=${isSortOpen}
                  onOpenChange=${setIsSortOpen}
                  menuWidth=${SORT_MENU_WIDTH}
                  testID="authenticator-sort-menu"
                  trigger=${html`
                    <${Button}
                      variant="tertiary"
                      size="small"
                      data-testid="authenticator-header-sort"
                      aria-label=${i18n._('Sort items')}
                      iconBefore=${html`<${FilterList} color=${iconColor} />`}
                    />
                  `}
                >
                  ${sortOptions.map(
                    ({ key, label, Icon }) => html`
                      <${NavbarListItem}
                        key=${key}
                        size="small"
                        label=${label}
                        icon=${html`<${Icon} color=${iconColor} />`}
                        additionalItems=${sortKey === key
                          ? html`<${Check} color=${iconColor} />`
                          : undefined}
                        onClick=${() => handleSelectSort(key)}
                      />
                    `
                  )}
                <//>
              </div>
            `}
          />
        </div>
      </div>

      ${isMultiSelectOn &&
      html`<${MultiSelectActionsBar}
        selectedCount=${selectedCount}
        allSelectedFavorited=${allSelectedFavorited}
        canMove=${hasCustomFolders}
        onMove=${handleMove}
        onToggleFavorite=${handleToggleFavorite}
        onDelete=${handleDelete}
      />`}
      ${otpRecords.length === 0 && !!searchValue
        ? html`<${EmptyResultsView} />`
        : otpRecords.length === 0
          ? html`
              <div
                style=${emptyStateStyles.container}
                data-testid="authenticator-empty-state"
              >
                <div style=${emptyStateStyles.content}>
                  <div style=${emptyStateStyles.illustration}>
                    <${ItemCardIllustration}
                      width=${null}
                      height=${ILLUSTRATION_HEIGHT}
                    />
                  </div>

                  <div style=${emptyStateStyles.textBlock}>
                    <${Title} as="h2">${i18n._('No codes saved')}<//>
                    <${Text}
                      as="p"
                      variant="label"
                      color=${theme.colors.colorTextSecondary}
                      style=${emptyStateStyles.descriptionParagraph}
                    >
                      ${i18n._(
                        'Save your first authenticator code or import your codes from another authenticator app.'
                      )}
                    <//>
                  </div>

                  <div style=${emptyStateStyles.ctas}>
                    <div style=${emptyStateStyles.ctaButton}>
                      <${Button}
                        variant="primary"
                        size="small"
                        fullWidth
                        data-testid="authenticator-empty-add-code"
                        iconBefore=${html`<${Add} width=${16} height=${16} />`}
                        onClick=${() =>
                          handleCreateOrEditRecord({
                            recordType: RECORD_TYPES.OTP
                          })}
                      >
                        ${i18n._('Add Code')}
                      <//>
                    </div>
                    ${DESKTOP_2FA_IMPORTS_ENABLED &&
                    html`
                      <div style=${emptyStateStyles.ctaButton}>
                        <${Button}
                          variant="secondary"
                          size="small"
                          fullWidth
                          data-testid="authenticator-empty-import-codes"
                          iconBefore=${html`<${ImportExport}
                            width=${16}
                            height=${16}
                            color=${iconColor}
                          />`}
                          onClick=${() =>
                            navigate('settings', {
                              initialTab: SettingsItemKey.ImportItems
                            })}
                        >
                          ${i18n._('Import Codes')}
                        <//>
                      </div>
                    `}
                  </div>
                </div>
              </div>
            `
          : html`
              <div style=${listStyles.wrapper}>
                <div
                  style=${listStyles.scrollArea}
                  data-testid="authenticator-record-list"
                >
                  ${totpGroups.map(
                    ({ period, records: groupRecords }, groupIndex) => {
                      const timeRemaining =
                        groupRecords[0]?.otpPublic?.timeRemaining ?? null
                      const expiring = isExpiring(timeRemaining)
                      const timerColor = expiring
                        ? theme.colors.colorTextDestructive
                        : theme.colors.colorPrimary
                      const isLastTotpGroup =
                        groupIndex === totpGroups.length - 1
                      const hasNext = !isLastTotpGroup || hotpRecords.length > 0

                      return html`
                        <div key=${period} style=${listStyles.section}>
                          <div style=${listStyles.staticSectionHeader}>
                            <${TimerCircle}
                              timeRemaining=${timeRemaining}
                              period=${period}
                            />
                            <span>
                              ${i18n._('Codes expiring in')}${' '}
                              <strong
                                style=${{ color: timerColor, fontWeight: 600 }}
                              >
                                ${timeRemaining !== null
                                  ? `${timeRemaining}s`
                                  : `${period}s`}
                              </strong>
                            </span>
                          </div>
                          <div style=${listStyles.sectionList}>
                            ${groupRecords.map((record) =>
                              renderRecordRow(record)
                            )}
                          </div>
                        </div>
                        ${hasNext && html`<div style=${listStyles.divider} />`}
                      `
                    }
                  )}
                  ${hotpRecords.length > 0 &&
                  html`
                    <div style=${listStyles.section}>
                      <div style=${listStyles.staticSectionHeader}>
                        <span>${i18n._('Counter-based')}</span>
                      </div>
                      <div style=${listStyles.sectionList}>
                        ${hotpRecords.map((record) => renderRecordRow(record))}
                      </div>
                    </div>
                  `}
                </div>
              </div>
            `}
    </div>
  `
}
