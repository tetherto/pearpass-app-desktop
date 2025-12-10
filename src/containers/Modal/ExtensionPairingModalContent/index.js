import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import {
  ModalActions,
  ModalContainer,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle
} from './styles'
import { AlertBox } from '../../../components/AlertBox'
import {
  ListItemContainer,
  ListItemDate,
  ListItemDescription,
  ListItemInfo,
  ListItemName
} from '../../../components/ListItem/styles'
import { useModal } from '../../../context/ModalContext'
import { ButtonSecondary } from '../../../lib-react-components'
import { Description } from '../../../pages/SettingsView/ExportTab/styles'

export const ExtensionPairingModalContent = ({
  onCopy,
  pairingToken,
  loadingPairing,
  copyFeedback,
  tokenCreationDate,
  fingerprint
}) => {
  const { i18n } = useLingui()
  const { closeModal } = useModal()

  const formatCreationDate = (isoDate) => {
    if (!isoDate) return ''
    try {
      const date = new Date(isoDate)
      return i18n._('Created on {date} at {time}', {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString()
      })
    } catch {
      return ''
    }
  }

  return html`
    <${ModalContainer}>
      <${ModalHeader}>
        <${ModalTitle}> ${i18n._('Extension Pairing')} <//>
        <${ModalDescription}>
          ${i18n._(
            'Click below to copy the pairing token to your clipboard, then paste it in your browser extension to establish secure communication.'
          )}
        <//>
      <//>
      <${ModalContent}>
        <${ListItemContainer}
          onClick=${onCopy}
          style=${{
            cursor: pairingToken && !loadingPairing ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
            borderRadius: '8px'
          }}
          onMouseEnter=${(e) => {
            if (pairingToken && !loadingPairing) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
            }
          }}
          onMouseLeave=${(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <${ListItemInfo}>
            <${ListItemDescription}>
              <${ListItemName}
                style=${{
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
                >${loadingPairing
                  ? i18n._('Loading...')
                  : pairingToken || i18n._('Unavailable')}<//
              >
              <${ListItemDate}
                >${copyFeedback || formatCreationDate(tokenCreationDate)}<//
              >
            <//>
          <//>
        <//>

        <${AlertBox}
          message=${i18n._(
            'Security Note: Only enter this token in the official PearPass browser extension. Never share it with anyone or enter it on websites.'
          )}
        />
        <${Description}
          style=${{
            display: 'block',
            marginTop: '8px',
            fontSize: '12px',
            color: '#666'
          }}
        >
          ${i18n._('Fingerprint (for verification): ')}${loadingPairing
            ? ''
            : fingerprint
              ? fingerprint.slice(0, 16) + '...'
              : ''}
        <//>
      <//>
      <${ModalActions}>
        <${ButtonSecondary} onClick=${closeModal}> ${i18n._('Close')} <//>
      <//>
    <//>
  `
}
