import { html } from 'htm/react'

import { useCountDown } from 'pear-apps-lib-ui-react-hooks'

import { ExpireTime } from './styles'

interface Props {
  onFinish?: () => void
}

export const ScanQRExpireTimer = ({ onFinish }: Props) => {
  const expireTime = useCountDown({
    initialSeconds: 120,
    onFinish
  })

  return html`<${ExpireTime}> ${expireTime} <//>`
}
