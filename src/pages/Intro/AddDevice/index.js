import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useCountDown } from 'pear-apps-lib-ui-react-hooks'
import { colors } from 'pearpass-lib-ui-theme-provider'

import {
  Container,
  Content,
  ExpireText,
  ExpireTime,
  Header,
  LeftSide,
  QrContainer,
  QrImage,
  Text
} from './styles'
import {
  ButtonRoundIcon,
  TimeIcon,
  UserSecurityIcon,
  XIcon
} from '../../../lib-react-components'

export const AddDevice = () => {
  const { i18n } = useLingui()

  const expireTime = useCountDown({
    initialSeconds: 120
  })

  return html`
    <${Container}>
      <${Header}>
        <${LeftSide}>
          <${UserSecurityIcon} size="24" color=${colors.white.mode1} />
          <${Text}> ${i18n._('Add Device')} <//>
        <//>
        <${ButtonRoundIcon} startIcon=${XIcon} />
      <//>
      <${Content}>
        <${Text}> ${i18n._('Scan this QR code')} <//>
        <${QrContainer}>
          <${QrImage} src="assets/images/intro_qr.png" />
        <//>
      <//>

      <${ExpireText}>
        ${i18n._('This link will expire in')}
        <${ExpireTime}> ${expireTime} <//>
        <${TimeIcon} size="24" color=${colors.primary400.mode1} />
      <//>
    <//>
  `
}
