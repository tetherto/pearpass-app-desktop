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
export const CheckIcon = (props) => {
  const { width, height, color } = getIconProps(props)

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 25 25"
      fill="none"
    >
      <path
        d="M9.8423 17.6296L4.87305 12.6604L5.58655 11.9469L9.8423 16.2026L18.998 7.04688L19.7115 7.76037L9.8423 17.6296Z"
        fill=${color}
      />
    </svg>
  `
}
