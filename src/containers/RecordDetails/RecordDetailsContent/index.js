import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import { html } from 'htm/react'

import { CreditCardDetailsForm } from '../CreditCardDetailsForm/CreditCardDetailsForm'
import { CustomDetailsForm } from '../CustomDetailsForm/CustomDetailsForm'
import { IdentityDetailsForm } from '../IdentityDetailsForm/IdentityDetailsForm'
import { LoginRecordDetailsForm } from '../LoginRecordDetailsForm/LoginRecordDetailsForm'
import { NoteDetailsForm } from '../NoteDetailsForm/NoteDetailsForm'
import { PassPhraseDetailsForm } from '../PassPhraseDetailsForm/PassPhraseDetailsForm'
import { WifiDetailsForm } from '../WifiDetailsForm/WifiDetailsForm'

/**
 * @param {{
 *   record: {
 *      type: 'note' | 'creditCard' | 'custom' | 'identity' | 'login'
 *    }
 *  selectedFolder?: string
 * }} props
 */
export const RecordDetailsContent = ({ record, selectedFolder }) => {
  if (record?.type === RECORD_TYPES.CREDIT_CARD) {
    return html`<${CreditCardDetailsForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.CUSTOM) {
    return html`<${CustomDetailsForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.IDENTITY) {
    return html`<${IdentityDetailsForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.LOGIN) {
    return html`<${LoginRecordDetailsForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.NOTE) {
    return html`<${NoteDetailsForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.WIFI_PASSWORD) {
    return html`<${WifiDetailsForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
  if (record?.type === RECORD_TYPES.PASS_PHRASE) {
    return html`<${PassPhraseDetailsForm}
      initialRecord=${record}
      selectedFolder=${selectedFolder}
    />`
  }
}
