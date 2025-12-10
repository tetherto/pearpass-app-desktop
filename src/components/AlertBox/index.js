import { useRef, useEffect, useState } from 'react'

import { html } from 'htm/react'

import { IconWrapper, Container, Message } from './styles'
import { ErrorIcon, YellowErrorIcon } from '../../lib-react-components'

export const AlertBox = ({ message, type = 'warning' }) => {
  const messageRef = useRef(null)
  const [isMultiLine, setIsMultiLine] = useState(false)

  useEffect(() => {
    if (messageRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(messageRef.current).lineHeight
      )
      const height = messageRef.current.offsetHeight
      setIsMultiLine(height > lineHeight * 1.2)
    }
  }, [message])

  return html`
    <${Container} type=${type} $isMultiLine=${isMultiLine}>
      <${IconWrapper}>
        <${type === 'warning' ? YellowErrorIcon : ErrorIcon} size="18" />
      <//>

      <${Message} ref=${messageRef}> ${message} <//>
    <//>
  `
}
