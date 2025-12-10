import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { useModal } from '../../../context/ModalContext'
import { ButtonPrimary, ButtonSecondary } from '../../../lib-react-components'
import { ModalContent } from '../ModalContent'
import { ButtonWrapper, HeaderWrapper, TextWrapper } from './styles'

/**
 * @param {{
 *    title: string
 *    text: string
 *    primaryAction: () => void
 *    secondaryAction: () => void
 *    primaryLabel: string
 *    secondaryLabel: string
 * }} props
 */
export const ConfirmationModalContent = (props) => {
  const { i18n } = useLingui()

  const {
    title = i18n._('Are you sure?'),
    text = i18n._('Are you sure you want to proceed?'),
    primaryAction,
    secondaryAction,
    primaryLabel = i18n._('Confirm'),
    secondaryLabel = i18n._('Cancel')
  } = props

  const { closeModal } = useModal()

  return html`
    <${ModalContent}
      onClose=${closeModal}
      headerChildren=${html` <${HeaderWrapper}> ${title} <//> `}
    >
      <${TextWrapper}> ${text} <//>

      <${ButtonWrapper}>
        <${ButtonPrimary} onClick=${primaryAction}> ${primaryLabel} <//>

        <${ButtonSecondary} onClick=${secondaryAction}> ${secondaryLabel} <//>
      <//>
    <//>
  `
}
