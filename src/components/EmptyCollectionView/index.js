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
import { useTranslation } from '../../hooks/useTranslation'
import { ButtonCreate } from '../../lib-react-components'

export const EmptyCollectionView = () => {
  const { data } = useRouter()
  const { t } = useTranslation()
  const { handleCreateOrEditRecord } = useCreateOrEditRecord()

  const createCollectionOptions = [
    { text: t('Create a login'), type: RECORD_TYPES.LOGIN },
    { text: t('Create an identity'), type: RECORD_TYPES.IDENTITY },
    {
      text: t('Create a credit card'),
      type: RECORD_TYPES.CREDIT_CARD
    },
    { text: t('Save a Wi-fi'), type: RECORD_TYPES.WIFI_PASSWORD },
    { text: t('Save a Recovery phrase'), type: RECORD_TYPES.PASS_PHRASE },
    { text: t('Create a note'), type: RECORD_TYPES.NOTE },
    { text: t('Create a custom element'), type: RECORD_TYPES.CUSTOM }
  ]

  return html`
    <${CollectionsWrapper}>
      <${CollectionsContainer}>
        <${CollectionsTitle}>
          <span> ${t('This collection is empty.')}</span>

          <p>${t('Create a new element or pass to another collection')}</p>
        <//>

        ${createCollectionOptions
          .filter(
            (option) =>
              data.recordType === 'all' || option.type === data.recordType
          )
          .map(
            (option) => html`
              <${ButtonCreate}
                key=${option.type}
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
