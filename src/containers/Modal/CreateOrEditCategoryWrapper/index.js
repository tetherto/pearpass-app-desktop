import { useState } from 'react'

import { html } from 'htm/react'
import { RECORD_TYPES } from 'pearpass-lib-vault'

import { CreateOrEditCreditCardModalContent } from './CreateOrEditCreditCardModalContent'
import { CreateOrEditCustomModalContent } from './CreateOrEditCustomModalContent'
import { CreateOrEditIdentityModalContent } from './CreateOrEditIdentityModalContent'
import { CreateOrEditLoginModalContent } from './CreateOrEditLoginModalContent'
import { CreateOrEditNoteModalContent } from './CreateOrEditNoteModalContent'
import { CreateOrEditPassPhraseModalContent } from './CreateOrEditPassPhraseModalContent'
import { CreateOrEditWifiModalContent } from './CreateOrEditWifiModalContent'

export const CreateOrEditCategoryWrapper = ({
  initialRecord,
  selectedFolder,
  recordType
}) => {
  const [currentRecordType, setCurrentRecordType] = useState(recordType)

  if (currentRecordType === RECORD_TYPES.LOGIN) {
    return html`<${CreateOrEditLoginModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.CREDIT_CARD) {
    return html`<${CreateOrEditCreditCardModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.IDENTITY) {
    return html`<${CreateOrEditIdentityModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.NOTE) {
    return html`<${CreateOrEditNoteModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.WIFI_PASSWORD) {
    return html`<${CreateOrEditWifiModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.PASS_PHRASE) {
    return html`<${CreateOrEditPassPhraseModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.CUSTOM) {
    return html`<${CreateOrEditCustomModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      onTypeChange=${setCurrentRecordType}
    />`
  }
}
