import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useCountDown } from 'pear-apps-lib-ui-react-hooks'

import {
  ButtonWrapper,
  Container,
  Description,
  Timer,
  TimerTitle,
  TimerWrapper,
  Title
} from './styles'
import { useModal } from '../../../context/ModalContext'
import { ButtonPrimary } from '../../../lib-react-components'

/**
 * @param {{
 *  onUpdate: () => void
 * }} props
 */
export const UpdateRequiredModalContent = ({ onUpdate }) => {
  const { closeModal } = useModal()
  const { i18n } = useLingui()

  const handleUpdateApp = () => {
    onUpdate?.()
    closeModal()
  }

  const expireTime = useCountDown({
    initialSeconds: 120,
    onFinish: handleUpdateApp
  })

  return html` <${Container}>
    <${Title}> ${i18n._('Update Required')} <//>
    <${Description}>
      ${i18n._(
        'Find out what exciting features and updates await you in this version.'
      )}
    <//>

    <${TimerWrapper}>
      <${TimerTitle}> ${i18n._('App will restart in:')} <//>
      <${Timer}> ${expireTime} <//>
    <//>

    <${ButtonWrapper}>
      <${ButtonPrimary} onClick=${handleUpdateApp}> ${i18n._('Update App')} <//>
    <//>
  <//>`
}
