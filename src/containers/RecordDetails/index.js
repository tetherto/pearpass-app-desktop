import React, { useEffect, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { generateAvatarInitials } from 'pear-apps-utils-avatar-initials'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { useRecordById, useRecords } from 'pearpass-lib-vault'

import { RecordDetailsContent } from './RecordDetailsContent'
import {
  Fields,
  FavoriteButtonWrapper,
  FolderWrapper,
  Header,
  HeaderRight,
  RecordActions,
  Title,
  RecordInfo
} from './styles'
import { PopupMenu } from '../../components/PopupMenu'
import { RecordActionsPopupContent } from '../../components/RecordActionsPopupContent'
import { RecordAvatar } from '../../components/RecordAvatar'
import { RECORD_COLOR_BY_TYPE } from '../../constants/recordColorByType'
import { useRouter } from '../../context/RouterContext'
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'
import { useRecordActionItems } from '../../hooks/useRecordActionItems'
import {
  BrushIcon,
  ButtonLittle,
  ButtonRoundIcon,
  CollapseIcon,
  FolderIcon,
  KebabMenuIcon,
  StarIcon
} from '../../lib-react-components'

export const RecordDetails = () => {
  const { i18n } = useLingui()

  const [isOpen, setIsOpen] = useState(false)

  const { currentPage, data: routerData, navigate } = useRouter()

  const { data: record } = useRecordById({
    variables: { id: routerData.recordId }
  })

  const { handleCreateOrEditRecord } = useCreateOrEditRecord()
  const { updateFavoriteState } = useRecords()

  const { actions } = useRecordActionItems({
    excludeTypes: ['select', 'pin'],
    record: record,
    onClose: () => {
      setIsOpen(false)
    }
  })

  const handleEdit = () => {
    handleCreateOrEditRecord({
      recordType: record?.type,
      initialRecord: record
    })
  }

  const handleCollapseRecordDetails = () => {
    navigate(currentPage, { ...routerData, recordId: '' })
  }

  useEffect(() => {
    if (!record) {
      handleCollapseRecordDetails()
    }
  }, [record])

  if (!record) {
    return null
  }

  const domain = record.type === 'login' ? record?.data?.websites?.[0] : null

  return html`
    <${React.Fragment}>
      <${Header} data-testid="details-header">
        <${RecordInfo}>
          <${RecordAvatar}
            testId=${`details-avatar-${generateAvatarInitials(record?.data?.title)}`}
            websiteDomain=${domain}
            initials=${generateAvatarInitials(record?.data?.title)}
            isFavorite=${record?.isFavorite}
            color=${RECORD_COLOR_BY_TYPE[record?.type]}
          />
          <div>
            <${Title} data-testid=${`details-title-${record?.id}`}>
              ${record?.data?.title}
            <//>

            ${!!record?.folder &&
            html`
              <${FolderWrapper}
                data-testid=${`details-folder-${record?.folder ?? 'none'}`}
              >
                <${FolderIcon} size="24" color=${colors.grey200.mode1} />
                ${record?.folder}
              <//>
            `}
          </div>
        <//>

        <${HeaderRight}>
          <${FavoriteButtonWrapper}
            data-testid="details-button-favorite"
            favorite=${record?.isFavorite}
            onClick=${() =>
              updateFavoriteState([record?.id], !record?.isFavorite)}
          >
            <${StarIcon}
              size="24"
              fill=${record?.isFavorite}
              color=${colors.primary400.mode1}
            />
          <//>

          <${ButtonLittle}
            data-testid="details-button-edit"
            startIcon=${BrushIcon}
            onClick=${handleEdit}
          >
            ${i18n._('Edit')}
          <//>

          <${RecordActions}>
            <${PopupMenu}
              side="right"
              align="right"
              isOpen=${isOpen}
              setIsOpen=${setIsOpen}
              content=${html`
                <${RecordActionsPopupContent} menuItems=${actions} />
              `}
            >
              <${ButtonRoundIcon}
                data-testid="details-button-actions"
                startIcon=${KebabMenuIcon}
              />
            <//>
          <//>

          <${ButtonRoundIcon}
            data-testid="details-button-collapse"
            startIcon=${CollapseIcon}
            onClick=${handleCollapseRecordDetails}
          />
        <//>
      <//>
      <${Fields}>
        <${RecordDetailsContent} record=${record} />
      <//>
    <//>
  `
}
