import React, { useEffect, useState } from 'react'

import {
  Button,
  ContextMenu,
  ItemScreenHeader,
  NavbarListItem,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ContentCopy,
  DriveFileMoveOutlined,
  EditOutlined,
  MoreVert,
  StarBorder,
  StarFilled,
  TrashOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'
// @ts-expect-error - declaration file is incomplete
import { useRecordById } from '@tetherto/pearpass-lib-vault'

import { RecordItemIcon } from '../../components/RecordItemIcon'
import { useRouter } from '../../context/RouterContext'
import { useRecordActionItems } from '../../hooks/useRecordActionItems'
import { useTranslation } from '../../hooks/useTranslation'
import { RecordDetailsContent } from './RecordDetailsContent'
import { createStyles } from './RecordDetailsV2.styles'

type RecordAction = {
  type: 'favorite' | 'edit' | 'move' | 'delete' | 'copy' | string
  name: string
  click?: () => void
}

const ACTION_ICON_BY_TYPE: Record<string, React.ComponentType<{ color?: string }>> = {
  copy: ContentCopy,
  move: DriveFileMoveOutlined,
  edit: EditOutlined,
  delete: TrashOutlined
}

const getActionIcon = (
  action: RecordAction,
  isFavorite: boolean,
  textColor: string,
  destructiveColor: string
): React.ReactElement => {
  if (action.type === 'favorite') {
    const FavoriteIcon = isFavorite ? StarFilled : StarBorder
    return <FavoriteIcon color={textColor} />
  }
  const Icon = ACTION_ICON_BY_TYPE[action.type] ?? MoreVert
  const iconColor = action.type === 'delete' ? destructiveColor : textColor
  return <Icon color={iconColor} />
}

type RecordShape = {
  id: string
  type: string
  isFavorite?: boolean
  folder?: string
  data?: {
    title?: string
    websites?: string[]
  }
}

export const RecordDetailsV2 = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentPage, data: routerData, navigate } = useRouter()

  const { data: record } = useRecordById({
    variables: { id: routerData.recordId }
  }) as { data?: RecordShape }

  const { actions } = useRecordActionItems({
    excludeTypes: ['select', 'pin'],
    record,
    onClose: () => setIsMenuOpen(false)
  })

  const handleCollapse = () => {
    navigate(currentPage, { ...routerData, recordId: '' })
  }

  useEffect(() => {
    if (routerData.recordId && !record) handleCollapse()
  }, [record, routerData.recordId])

  if (!record) return null

  const title = record?.data?.title ?? ''

  const avatar = (
    <RecordItemIcon
      record={record}
      size={24}
      testId={`details-avatar-v2-${record.type}`}
    />
  )

  const headerActions = (
    <ContextMenu
      open={isMenuOpen}
      onOpenChange={setIsMenuOpen}
      trigger={
        <Button
          variant="tertiary"
          size="small"
          aria-label={t('More actions')}
          iconBefore={
            <MoreVert
              color={theme.colors.colorTextPrimary}
            />
          }
          data-testid="details-button-actions-v2"
        />
      }
    >
      {(actions as RecordAction[]).map((action, index, list) => (
        <NavbarListItem
          key={action.name}
          label={action.name}
          icon={getActionIcon(
            action,
            !!record?.isFavorite,
            theme.colors.colorTextPrimary,
            theme.colors.colorSurfaceDestructiveElevated
          )}
          variant={action.type === 'delete' ? 'destructive' : 'default'}
          showDivider={list[index + 1]?.type === 'delete'}
          onClick={() => {
            setIsMenuOpen(false)
            action.click?.()
          }}
          testID={`details-actions-item-${action.type}-v2`}
        />
      ))}
    </ContextMenu>
  )

  return (
    <div style={styles.root} data-testid="details-header-v2">
      <div style={styles.header}>
        <ItemScreenHeader
          title={title}
          icon={avatar}
          actions={headerActions}
        />
      </div>

      <div style={styles.body}>
        <RecordDetailsContent record={record as unknown as Parameters<typeof RecordDetailsContent>[0]['record']} />
      </div>
    </div>
  )
}
