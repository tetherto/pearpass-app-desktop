import { html } from 'htm/react'
import { useCountDown } from 'pear-apps-lib-ui-react-hooks'

/**
 * Timer component that displays a countdown from an initial number of seconds.
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.initialSeconds - The initial number of seconds to count down from
 * @param {Function} [props.onFinish] - Optional callback function to be called when the countdown reaches zero
 * @returns {string}
 */
export const Timer = ({ initialSeconds, onFinish }) => {
  const timeRemaining = useCountDown({
    initialSeconds,
    onFinish
  })
  return html`${timeRemaining}`
}
