import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { ListItem, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import {
  ErrorFilled,
  ExpandMore,
  StarFilled
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './RecordListViewV2.styles'
import { RecordRowContextMenuV2 } from './RecordRowContextMenuV2'
import { RecordItemIcon } from '../../components/RecordItemIcon'
import { useRouter } from '../../context/RouterContext'
import { useTranslation } from '../../hooks/useTranslation'
import { getRecordSubtitle } from '../../utils/getRecordSubtitle'
import type {
  RecordSection,
  VaultRecord
} from '../../utils/groupRecordsByTimePeriod'

const ROW_RECORD_ID_ATTR = 'data-record-id'

type RecordListViewV2Props = {
  sections: RecordSection[]
  isMultiSelectOn?: boolean
  selectedRecords?: string[]
  setSelectedRecords?: (
    updater: string[] | ((prev: string[]) => string[])
  ) => void
  setIsMultiSelectOn?: (value: boolean) => void
}

type ActiveContextMenu = {
  record: VaultRecord
  position: { x: number; y: number }
}

const SECTION_TITLE_KEYS: Record<string, string> = {
  favorites: 'Favorites',
  all: 'All Items',
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  older: 'Older'
}

export const RecordListViewV2 = ({
  sections,
  isMultiSelectOn = false,
  selectedRecords = [],
  setSelectedRecords,
  setIsMultiSelectOn
}: RecordListViewV2Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentPage, navigate, data: routeData } = useRouter()
  const styles = createStyles(theme.colors)

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({})
  const [activeMenu, setActiveMenu] = useState<ActiveContextMenu | null>(null)

  const allRecords = useMemo(
    () => sections.flatMap((s) => s.data),
    [sections]
  )

  const toggleSection = useCallback((key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const selectedRecordsSet = useMemo(
    () => new Set(selectedRecords),
    [selectedRecords]
  )

  const handleRecordPress = useCallback(
    (record: VaultRecord) => {
      if (isMultiSelectOn) {
        setSelectedRecords?.((prev) =>
          prev.includes(record.id)
            ? prev.filter((id) => id !== record.id)
            : [...prev, record.id]
        )
        return
      }
      const isAlreadyOpen = routeData?.recordId === record.id
      navigate(currentPage, {
        recordId: isAlreadyOpen ? '' : record.id,
        recordType: routeData?.recordType
      })
    },
    [
      isMultiSelectOn,
      setSelectedRecords,
      navigate,
      currentPage,
      routeData?.recordId,
      routeData?.recordType
    ]
  )

  const handleRowContextMenu = useCallback(
    (event: React.MouseEvent, record: VaultRecord) => {
      if (isMultiSelectOn) return
      event.preventDefault()
      setActiveMenu({
        record,
        position: { x: event.clientX, y: event.clientY }
      })
    },
    [isMultiSelectOn]
  )

  // The overlay covers rows while open; re-target right-clicks via the
  // element stack at the cursor.
  useEffect(() => {
    if (!activeMenu) return
    const handler = (event: MouseEvent) => {
      event.preventDefault()
      const stack = document.elementsFromPoint(event.clientX, event.clientY)
      let recordId: string | null = null
      for (const el of stack) {
        const row = (el as HTMLElement).closest?.(`[${ROW_RECORD_ID_ATTR}]`) as
          | HTMLElement
          | null
        if (row) {
          recordId = row.getAttribute(ROW_RECORD_ID_ATTR)
          break
        }
      }
      const next = recordId
        ? allRecords.find((r) => r.id === recordId)
        : undefined
      setActiveMenu(
        next
          ? { record: next, position: { x: event.clientX, y: event.clientY } }
          : null
      )
    }
    document.addEventListener('contextmenu', handler, true)
    return () => document.removeEventListener('contextmenu', handler, true)
  }, [activeMenu, allRecords])

  const iconColor = theme.colors.colorTextSecondary
  const alertColor = theme.colors.colorSurfaceDestructiveElevated

  return (
    <div style={styles.wrapper}>
      <div style={styles.scrollArea} data-testid="record-list-v2">
        {sections.map((section, sectionIndex) => {
          const isCollapsed = !!collapsedSections[section.key]
          const labelKey = SECTION_TITLE_KEYS[section.key] ?? section.title
          const label = t(labelKey)
          const isLastSection = sectionIndex === sections.length - 1

          return (
            <React.Fragment key={section.key}>
              <div style={styles.section}>
                <button
                  type="button"
                  style={styles.sectionHeader}
                  onClick={() => toggleSection(section.key)}
                  data-testid={`record-list-section-${section.key}`}
                >
                  <div
                    style={{
                      ...styles.sectionHeaderChevron,
                      ...(isCollapsed
                        ? styles.sectionHeaderChevronCollapsed
                        : {})
                    }}
                  >
                    <ExpandMore width={16} height={16} color={iconColor} />
                  </div>

                  {section.isFavorites && (
                    <StarFilled width={14} height={14} color={iconColor} />
                  )}

                  <span>{label}</span>
                </button>

                {!isCollapsed && (
                  <div style={styles.sectionList}>
                    {section.data.map((record) => {
                      const isSelected = selectedRecordsSet.has(record.id)
                      return (
                        <div
                          key={record.id}
                          {...{ [ROW_RECORD_ID_ATTR]: record.id }}
                          onContextMenu={(event) =>
                            handleRowContextMenu(event, record)
                          }
                        >
                          <ListItem
                            icon={<RecordItemIcon record={record} />}
                            iconSize={32}
                            title={record.data?.title ?? ''}
                            subtitle={getRecordSubtitle(record) || undefined}
                            selectionMode={
                              isMultiSelectOn ? 'multi' : 'none'
                            }
                            isSelected={isSelected}
                            onSelect={() => handleRecordPress(record)}
                            onClick={() => handleRecordPress(record)}
                            testID={`record-list-item-${record.id}`}
                            isCheckboxSelectable={false}
                            style={
                              styles.recordRow as React.ComponentProps<
                                typeof ListItem
                              >['style']
                            }
                            rightElement={
                              !isMultiSelectOn ? (
                                <div style={styles.rowRightElement}>
                                  {record.hasSecurityAlert && (
                                    <ErrorFilled
                                      width={20}
                                      height={20}
                                      color={alertColor}
                                    />
                                  )}
                                  <div style={styles.rowChevron}>
                                    <ExpandMore
                                      width={20}
                                      height={20}
                                      color={iconColor}
                                    />
                                  </div>
                                </div>
                              ) : undefined
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {!isLastSection && (
                <div
                  style={styles.divider}
                  role="separator"
                  data-testid={`record-list-divider-${section.key}`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div style={styles.fadeGradient} aria-hidden="true" />

      {activeMenu && (
        <RecordRowContextMenuV2
          key={activeMenu.record.id}
          record={activeMenu.record}
          open
          position={activeMenu.position}
          onOpenChange={(open) => {
            if (!open) setActiveMenu(null)
          }}
          setIsMultiSelectOn={setIsMultiSelectOn}
          setSelectedRecords={setSelectedRecords}
        />
      )}
    </div>
  )
}
