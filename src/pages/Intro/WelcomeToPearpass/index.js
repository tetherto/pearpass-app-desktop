import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { Container, ImageContainer, LeftText, Video } from './styles'
import { Header } from '../TutorialContainer/styles'

export const WelcomeToPearpass = ({ isLockLocked }) => {
  const { i18n } = useLingui()

  return html`
    <${Container}>
      <${LeftText} className=${isLockLocked ? 'fade-in' : ''}>
        <${Header}>
          <div>${i18n._('Fully local,')}</div>
          <div>${i18n._('Open-source,')}</div>
          <div>${i18n._('Password manager.')}</div>
        <//>
      <//>
      <${ImageContainer}>
        <${Video}
          src="assets/video/lock_close_4s.mp4"
          autoPlay
          className=${isLockLocked ? 'animate' : ''}
        />
      <//>
    <//>
  `
}
