import { html } from 'htm/react'

import { useCountDown } from 'pear-apps-lib-ui-react-hooks'

import { ExpireTime } from './styles'

export const ScanQRExpireTimer = () => {
  const expireTime = useCountDown({
    initialSeconds: 120,
  })

  return html`<${ExpireTime}> ${expireTime} <//>`
}


