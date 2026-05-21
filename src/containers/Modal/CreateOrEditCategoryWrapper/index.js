import { useState } from 'react'

import { RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import { html } from 'htm/react'

import { CreateOrEditAuthenticatorModalContent } from './CreateOrEditAuthenticatorModalContent/CreateOrEditAuthenticatorModalContent'
import { CreateOrEditCreditCardModalContent } from './CreateOrEditCreditCardModalContent/CreateOrEditCreditCardModalContent'
import { CreateOrEditCustomModalContent } from './CreateOrEditCustomModalContent/CreateOrEditCustomModalContent'
import { CreateOrEditIdentityModalContent } from './CreateOrEditIdentityModalContent/CreateOrEditIdentityModalContent'
import { CreateOrEditLoginModalContent } from './CreateOrEditLoginModalContent/CreateOrEditLoginModalContent'
import { CreateOrEditNoteModalContent } from './CreateOrEditNoteModalContent/CreateOrEditNoteModalContent'
import { CreateOrEditPassPhraseModalContent } from './CreateOrEditPassPhraseModalContent/CreateOrEditPassPhraseModalContent'
import { CreateOrEditWifiModalContent } from './CreateOrEditWifiModalContent/CreateOrEditWifiModalContent'

export const CreateOrEditCategoryWrapper = ({
  initialRecord,
  selectedFolder,
  recordType,
  isFavorite
}) => {
  const [currentRecordType, setCurrentRecordType] = useState(recordType)

  if (currentRecordType === RECORD_TYPES.OTP) {
    if (initialRecord) {
      return html`<${CreateOrEditLoginModalContent}
        initialRecord=${initialRecord}
        selectedFolder=${selectedFolder}
        isFavorite=${isFavorite}
        onTypeChange=${setCurrentRecordType}
      />`
    }

    return html`<${CreateOrEditAuthenticatorModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.LOGIN) {
    return html`<${CreateOrEditLoginModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.CREDIT_CARD) {
    return html`<${CreateOrEditCreditCardModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.IDENTITY) {
    return html`<${CreateOrEditIdentityModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.NOTE) {
    return html`<${CreateOrEditNoteModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.WIFI_PASSWORD) {
    return html`<${CreateOrEditWifiModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.PASS_PHRASE) {
    return html`<${CreateOrEditPassPhraseModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
      onTypeChange=${setCurrentRecordType}
    />`
  }

  if (currentRecordType === RECORD_TYPES.CUSTOM) {
    return html`<${CreateOrEditCustomModalContent}
      initialRecord=${initialRecord}
      selectedFolder=${selectedFolder}
      isFavorite=${isFavorite}
      onTypeChange=${setCurrentRecordType}
    />`
  }
}
