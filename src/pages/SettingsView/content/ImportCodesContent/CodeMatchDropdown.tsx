import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  InputField,
  ListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { Link } from '@tetherto/pearpass-lib-ui-kit/icons'

import { RecordItemIcon } from '../../../../components/RecordItemIcon/RecordItemIcon'
import { useTranslation } from '../../../../hooks/useTranslation'
import { getRecordSubtitle } from '../../../../utils/getRecordSubtitle'

const MENU_WIDTH = 250
const MENU_HEIGHT = 300
const MENU_GAP = 4
const VIEWPORT_MARGIN = 8

const MENU_BOX_SHADOW =
  '0 185px 52px 0 rgba(8,10,5,0.01), 0 118px 47px 0 rgba(8,10,5,0.06), 0 67px 40px 0 rgba(8,10,5,0.20), 0 30px 30px 0 rgba(8,10,5,0.34), 0 7px 16px 0 rgba(8,10,5,0.39)'

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

type CodeMatchDropdownProps = {
  open: boolean
  anchorRect: DOMRect | null
  onClose: () => void
  dropdownSearch: string
  onSearchChange: (v: string) => void
  records: VaultRecord[]
  onSelectRecord: (record: VaultRecord) => void
}

export const CodeMatchDropdown = ({
  open,
  anchorRect,
  onClose,
  dropdownSearch,
  onSearchChange,
  records,
  onSelectRecord
}: CodeMatchDropdownProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  )

  useLayoutEffect(() => {
    if (!open || !anchorRect) {
      setCoords(null)
      return
    }
    const el = menuRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const viewportWidth =
      typeof window !== 'undefined' ? window.innerWidth : Infinity
    const viewportHeight =
      typeof window !== 'undefined' ? window.innerHeight : Infinity

    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(
        anchorRect.right - MENU_WIDTH,
        viewportWidth - MENU_WIDTH - VIEWPORT_MARGIN
      )
    )

    const fitsBelow =
      anchorRect.bottom + MENU_GAP + rect.height <=
      viewportHeight - VIEWPORT_MARGIN
    const top = fitsBelow
      ? anchorRect.bottom + MENU_GAP
      : Math.max(VIEWPORT_MARGIN, anchorRect.top - rect.height - MENU_GAP)

    setCoords({ top, left })
  }, [open, anchorRect])

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const visibility = coords === null ? 'hidden' : 'visible'
  const top = coords?.top ?? 0
  const left = coords?.left ?? 0

  return createPortal(
    <>
      <div
        onClick={onClose}
        onContextMenu={(event) => event.preventDefault()}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'transparent',
          zIndex: 999
        }}
      />
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top,
          left,
          width: MENU_WIDTH,
          height: MENU_HEIGHT,
          visibility,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.colors.colorSurfacePrimary,
          border: `1px solid ${theme.colors.colorBorderPrimary}`,
          borderRadius: 8,
          paddingBlock: 4,
          paddingInline: 4,
          zIndex: 1000,
          boxSizing: 'border-box',
          boxShadow: MENU_BOX_SHADOW
        }}
      >
        <div style={{ padding: '8px 8px 4px', flexShrink: 0 }}>
          <InputField
            label={''}
            value={dropdownSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('Search...')}
            testID="import-codes-match-search"
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {records.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '0 16px'
              }}
            >
              <Text variant="caption" color={theme.colors.colorTextSecondary}>
                {t('No login records found')}
              </Text>
            </div>
          ) : (
            records.map((record) => (
              <ListItem
                key={record.id}
                icon={<RecordItemIcon record={record} size={16} />}
                iconSize={16}
                iconAlign="top"
                title={record.data?.title ?? ''}
                subtitle={getRecordSubtitle(record) || undefined}
                rightElement={
                  <Link
                    width={16}
                    height={16}
                    color={theme.colors.colorTextTertiary}
                  />
                }
                onClick={() => onSelectRecord(record)}
                testID={`import-codes-match-record-${record.id}`}
              />
            ))
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
