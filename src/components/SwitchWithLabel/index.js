import { html } from 'htm/react'

import { ContentWrapper, Description, Label, Wrapper } from './styles'
import { Switch } from '../../lib-react-components'

/**
 * @param {{
 *  isOn?: boolean,
 *  onChange?: (isOn: boolean) => void
 *  label?: string,
 *  description?: string,
 *  isLabelBold?: boolean
 *  isSwitchFirst?: boolean
 *  stretch?: boolean
 *  disabled?: boolean
 * }} props
 */
export const SwitchWithLabel = ({
  isOn,
  onChange,
  label,
  description,
  isLabelBold,
  isSwitchFirst = false,
  stretch = true,
  disabled = false
}) => {
  const toggleSwitch = () => {
    if (!disabled) {
      onChange?.(!isOn)
    }
  }

  return html`
    <${Wrapper}
      isSwitchFirst=${isSwitchFirst}
      stretch=${stretch}
      onClick=${toggleSwitch}
    >
      <${ContentWrapper}>
        <${Label} isBold=${isLabelBold}> ${label} <//>
        ${description && html`<${Description}> ${description} <//>`}
      <//>
      <${Switch} isOn=${isOn} />
    <//>
  `
}
