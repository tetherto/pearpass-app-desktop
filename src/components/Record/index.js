import { useState } from 'react'

import { html } from 'htm/react'
import { generateAvatarInitials } from 'pear-apps-utils-avatar-initials'
import { formatOtpCode } from 'pearpass-lib-vault'

import { RECORD_COLOR_BY_TYPE } from '../../constants/recordColorByType'
import { useRecordActionItems } from '../../hooks/useRecordActionItems'
import { KebabMenuIcon } from '../../lib-react-components'
import { CopyButton } from '../CopyButton'
import { PopupMenu } from '../PopupMenu'
import { RecordActionsPopupContent } from '../RecordActionsPopupContent'
import { RecordAvatar } from '../RecordAvatar'
import {
  OtpCodeText,
  RecordActions,
  RecordInformation,
  RecordName,
  RecordRightSection,
  RecordWrapper
} from './styles'

/**
 *
 * @param {{
 *  record: {
 *    id: string
 *    createdAt: number
 *    updatedAt: number
 *    isFavorite: boolean
 *    vaultId: string
 *    folder: string
 *    type: 'note' | 'creditCard' | 'custom' | 'identity' | 'login'
 *    data: {
 *      title: string
 *      [key: string]: any
 *    }
 *  },
 *  isSelected: boolean,
 *  onClick: () => void
 *  onSelect: () => void,
 *  testId?: string,
 *  dataId?: string,
 *  otpCode?: string | null
 * }} props
 */
export const Record = ({
  record,
  isSelected = false,
  onClick,
  onSelect,
  testId,
  dataId,
  otpCode
}) => {
  const [isOpen, setIsOpen] = useState()

  const folderName = record?.folder

  const { actions } = useRecordActionItems({
    record,
    onSelect,
    onClose: () => {
      setIsOpen(false)
    }
  })

  const handleActionMenuToggle = (e) => {
    e.stopPropagation()

    setIsOpen(!isOpen)
  }

  const domain = record.type === 'login' ? record?.data?.websites?.[0] : null

  const formattedOtp = otpCode ? formatOtpCode(otpCode) : null

  return html`
    <${RecordWrapper}
      open=${isOpen}
      isSelected=${isSelected}
      onClick=${onClick}
      data-testid=${testId}
      data-id=${dataId}
    >
      <${RecordInformation}>
        <${RecordAvatar}
          websiteDomain=${domain}
          initials=${generateAvatarInitials(record?.data?.title)}
          isSelected=${isSelected}
          isFavorite=${record?.isFavorite}
          color=${RECORD_COLOR_BY_TYPE[record?.type]}
        />

        <${RecordName}>
          <span>${record?.data?.title}</span>

          <p>${folderName}</p>
        <//>
      <//>

      <${RecordRightSection}>
        ${formattedOtp &&
        html`
          <${OtpCodeText} data-testid="record-otp-code"> ${formattedOtp} <//>
          <span onClick=${(e) => e.stopPropagation()}>
            <${CopyButton} value=${otpCode} testId="record-otp-copy-button" />
          </span>
        `}
        ${!isSelected &&
        html` <${RecordActions}>
          <${PopupMenu}
            side="right"
            align="right"
            isOpen=${isOpen}
            setIsOpen=${setIsOpen}
            content=${html`
              <${RecordActionsPopupContent} menuItems=${actions} />
            `}
          >
            <div
              onClick=${handleActionMenuToggle}
              data-testid="list-item-threedots"
            >
              <${KebabMenuIcon} />
            </div>
          <//>
        <//>`}
      <//>
    <//>
  `
}
