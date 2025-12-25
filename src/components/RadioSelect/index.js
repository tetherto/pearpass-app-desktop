import { html } from 'htm/react'

import { RadioOption, RadioSelectWrapper, Title } from './styles'
import { ButtonRadio } from '../../lib-react-components'

/**
 * @param {{
 *  title?: string,
 *  options: { label: string, value: string }[],
 *  selectedOption: string,
 *  onChange: (value: string) => void,
 *  optionStyle?: object,
 *  titleStyle?: object,
 *  buttonType?: 'button' | 'submit',
 *  disabled?: boolean
 * }} props
 */
export const RadioSelect = ({
  title,
  options,
  selectedOption,
  onChange,
  optionStyle,
  titleStyle,
  buttonType = 'button',
  disabled = false
}) => {
  const handleChange = (value) => {
    onChange(value)
  }

  return html`
    <${RadioSelectWrapper} data-testid="radioselect-container">
      ${title && html`<${Title} style=${titleStyle}>${title}<//>`}
      ${options.map(
        (option) => html`
          <${RadioOption}
            key=${option.value}
            onClick=${() => handleChange(option.value)}
            style=${optionStyle}
            data-testid="radioselect-${option.value}-${selectedOption ===
            option.value
              ? 'active'
              : 'inactive'}"
          >
            <${ButtonRadio}
              type=${buttonType}
              isActive=${selectedOption === option.value}
              disabled=${disabled}
            />
            ${option.label}
          <//>
        `
      )}
    <//>
  `
}
