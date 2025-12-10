import { html } from 'htm/react'

import { getIconProps } from '../../utils/getIconProps'

/**
 * @param {{
 *  size?: string;
 *  width?: string;
 *  height?: string;
 *  color?: string;
 * }} props
 */
export const CreditCardIcon = (props) => {
  const { width, height, color, fill } = getIconProps(props)

  if (fill) {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width=${width}
        height=${height}
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d="M3.50684 19.3379V5.33789H21.5068V19.3379H3.50684ZM4.50684 11.5301H20.5068V9.14564H4.50684V11.5301Z"
          fill=${color}
        />
      </svg>
    `
  }

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 25 25"
      fill="none"
    >
      <path
        d="M3.50684 19.0254V5.02539H21.5068V19.0254H3.50684ZM4.50684 8.83314H20.5068V6.02539H4.50684V8.83314ZM4.50684 18.0254H20.5068V11.2176H4.50684V18.0254Z"
        fill=${color}
      />
    </svg>
  `
}
