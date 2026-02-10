import { html } from 'htm/react'

import { getIconProps } from '../../utils/getIconProps'

/**
 * Simple desktop/computer icon.
 *
 * @param {{
 *  size?: string;
 *  width?: string;
 *  height?: string;
 *  color?: string;
 * }} props
 */
export const ComputerIcon = (props) => {
  const { width, height, color } = getIconProps(props)

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M1 18.8845V17.8845H4.6155V17.1152H3V5.11523H21V17.1152H19.3845V17.8845H23V18.8845H1ZM4 16.1152H20V6.11523H4V16.1152Z"
        fill=${color}
      />
    </svg>
  `
}
