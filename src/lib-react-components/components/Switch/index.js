import { html } from 'htm/react'

import { SwitchBackground, SwitchThumb } from './styles'

/**
 * @param {{
 *  isOn: boolean,
 *  onChange: (isOn: boolean) => void,
 *  testId?: string
 * }} props
 */
export const Switch = ({ isOn, onChange, testId = 'switch' }) => {
  const toggleSwitch = () => {
    onChange?.(!isOn)
  }

  return html`
    <${SwitchBackground}
      onClick=${toggleSwitch}
      isOn=${isOn}
      data-testid=${testId}
    >
      <${SwitchThumb} isOn=${isOn} />
    <//>
  `
}
