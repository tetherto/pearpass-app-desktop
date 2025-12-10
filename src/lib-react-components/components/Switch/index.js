import { html } from 'htm/react'

import { SwitchBackground, SwitchThumb } from './styles'

/**
 * @param {{
 *  isOn: boolean,
 *  onChange: (isOn: boolean) => void
 * }} props
 */
export const Switch = ({ isOn, onChange }) => {
  const toggleSwitch = () => {
    onChange?.(!isOn)
  }

  return html`
    <${SwitchBackground} onClick=${toggleSwitch} isOn=${isOn}>
      <${SwitchThumb} isOn=${isOn} />
    <//>
  `
}
