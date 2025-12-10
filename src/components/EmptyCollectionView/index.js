import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { RECORD_TYPES } from 'pearpass-lib-vault'

import {
  CollectionsContainer,
  CollectionsTitle,
  CollectionsWrapper
} from './styles'
import { RECORD_ICON_BY_TYPE } from '../../constants/recordIconByType'
import { useRouter } from '../../context/RouterContext'
import { useCreateOrEditRecord } from '../../hooks/useCreateOrEditRecord'
import { ButtonCreate } from '../../lib-react-components'

export const EmptyCollectionView = () => {
  const { data } = useRouter()
  const { i18n } = useLingui()

  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const createCollectionOptions = [
    { text: i18n._('Create a login'), type: RECORD_TYPES.LOGIN },
    { text: i18n._('Create an identity'), type: RECORD_TYPES.IDENTITY },
    {
      text: i18n._('Create a credit card'),
      type: RECORD_TYPES.CREDIT_CARD
    },
    { text: i18n._('Save a Wi-fi'), type: RECORD_TYPES.WIFI_PASSWORD },
    { text: i18n._('Save a PassPhrase'), type: RECORD_TYPES.PASS_PHRASE },
    { text: i18n._('Create a note'), type: RECORD_TYPES.NOTE },
    { text: i18n._('Create a custom element'), type: RECORD_TYPES.CUSTOM }
  ]

  return html`
    <${CollectionsWrapper}>
      <${CollectionsContainer}>
        <${CollectionsTitle}>
          <span> ${i18n._('This collection is empty.')}</span>

          <p>${i18n._('Create a new element or pass to another collection')}</p>
        <//>

        ${createCollectionOptions
          .filter(
            (option) =>
              data.recordType === 'all' || option.type === data.recordType
          )
          .map(
            (option) => html`
              <${ButtonCreate}
                startIcon=${RECORD_ICON_BY_TYPE[option.type]}
                onClick=${() =>
                  handleCreateOrEditRecord({ recordType: option.type })}
              >
                ${option.text}
              <//>
            `
          )}
      <//>
    <//>
  `
}
