import { useRef, useEffect, useState } from 'react'
import { IconWrapper, Container, Message } from './styles'
import { ErrorIcon, YellowErrorIcon } from '../../lib-react-components'


export enum AlertBoxType {
  WARNING = 'warning', // eslint-disable-line no-unused-vars
  ERROR = 'error', // eslint-disable-line no-unused-vars
}

interface Props {
  message: string
  type?: AlertBoxType
  testId?: string
}

/**
 * @param {Object} props
 * @param {string} props.message
 * @param {('warning'|'error')} [props.type='warning']
 * @param {string} [props.testId]
 * @returns {JSX.Element}
 */
export const AlertBox = ({ message, type = AlertBoxType.WARNING, testId }: Props): React.ReactElement => {
  const messageRef = useRef<HTMLDivElement>(null)
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

  return (
    <Container
      type={type}
      $isMultiLine={isMultiLine}
      data-testid={testId}
    >
      <IconWrapper>
        {type === AlertBoxType.WARNING ? <YellowErrorIcon size="18" /> : <ErrorIcon size="18" />}
      </IconWrapper>

      <Message ref={messageRef}>{message}</Message>
    </Container>
  )
}
