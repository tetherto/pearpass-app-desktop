import { html } from 'htm/react'

import { StyledRange } from './styles'

/**
 * @param {{
 *  value: number,
 *  onChange: (value: number) => void,
 *  testId?: string,
 * }} props
 */
export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  testId = 'slider'
}) => {
  const handleChange = (event) => {
    const value = event.target.value
    onChange?.(parseFloat(value))
  }

  return html`
    <${StyledRange}
      value=${value}
      onChange=${handleChange}
      min=${min}
      max=${max}
      step=${step}
      data-testid=${testId}
    />
  `
}
