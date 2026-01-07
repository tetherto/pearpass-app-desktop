import React, { useState } from 'react'

import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import {
  BLIND_PEER_FORM_NAME,
  BLIND_PEERS_FORM_NAME,
  BLIND_PEER_TYPE
} from 'pearpass-lib-constants'

import { RadioSelect } from '../../../components/RadioSelect'
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonSingleInput,
  CompoundField,
  DeleteIcon,
  InputField,
  PlusIcon
} from '../../../lib-react-components'
import { ModalContent } from '../ModalContent'
import {
  ActionsContainer,
  ContentWrapper,
  FormWrapper,
  HeaderWrapper
} from './styles'
import { useTranslation } from '../../../hooks/useTranslation'

const { DEFAULT, PERSONAL } = BLIND_PEER_TYPE
/**
 * @component
 * @param {Object} props
 * @param {(data: { blindPeerType: 'default' | 'personal', blindPeers?: string[] }) => void} props.onConfirm
 * @param {() => void} props.onClose
 */
export const BlindPeersModalContent = ({ onConfirm, onClose }) => {
  const { t } = useTranslation()
  const [selectedOption, setSelectedOption] = useState(DEFAULT)

  const { registerArray } = useForm({
    initialValues: {
      blindPeers: [{ name: BLIND_PEER_FORM_NAME }]
    }
  })

  const {
    value: blindPeersList,
    addItem,
    registerItem,
    removeItem
  } = registerArray(BLIND_PEERS_FORM_NAME)

  const radioOptions = [
    { label: t('Automatic blind peers'), value: DEFAULT },
    { label: t('Manual blind peers'), value: PERSONAL }
  ]

  const handleOptionChange = (option) => {
    setSelectedOption(option)
  }

  const handleBlindPeersConfirm = async () => {
    if (selectedOption === DEFAULT) {
      onConfirm({ blindPeerType: DEFAULT })
    } else if (selectedOption === PERSONAL && blindPeersList.length > 0) {
      const blindPeers = blindPeersList
        .map((peer) => peer.blindPeer?.trim())
        .filter((peer) => peer && peer.length > 0)
      onConfirm({ blindPeerType: PERSONAL, blindPeers })
    }
  }

  return html`
    <${ModalContent}
      onClose=${onClose}
      headerChildren=${html`
        <${HeaderWrapper}> ${t('Choose your Blind Peer')} <//>
      `}
    >
      <${ContentWrapper}>
        <${RadioSelect}
          options=${radioOptions}
          selectedOption=${selectedOption}
          onChange=${handleOptionChange}
        />

        <${FormWrapper} isOpen=${selectedOption === PERSONAL}>
          <${CompoundField}>
            ${blindPeersList.map(
              (blindPeer, index) => html`
                <${React.Fragment} key=${blindPeer.id}>
                  <${InputField}
                    label=${'#' + (index + 1) + ' ' + t('Blind Peer')}
                    placeholder=${t('Add here your code...')}
                    isFirst=${index === 0}
                    ...${registerItem(BLIND_PEER_FORM_NAME, index)}
                    additionalItems=${index === 0
                      ? html`
                          <${ButtonSingleInput}
                            startIcon=${PlusIcon}
                            onClick=${() => addItem({ name: 'website' })}
                          >
                            ${t('Add Peer')}
                          <//>
                        `
                      : html`
                          <${ButtonSingleInput}
                            startIcon=${DeleteIcon}
                            onClick=${() => removeItem(index)}
                          >
                            ${t('Remove Peer')}
                          <//>
                        `}
                  />
                <//>
              `
            )}
          <//>
        <//>

        <${ActionsContainer}>
          <${ButtonPrimary} onClick=${handleBlindPeersConfirm}>
            ${t('Confirm')}
          <//>
          <${ButtonSecondary} onClick=${onClose}> ${t('Cancel')} <//>
        <//>
      <//>
    <//>
  `
}
