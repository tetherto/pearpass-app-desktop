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
export const BackIcon = (props) => {
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
        d="M7.6256 12.8379L13.4178 18.6301L12.7043 19.3379L5.70435 12.3379L12.7043 5.33789L13.4178 6.04564L7.6256 11.8379H19.7043V12.8379H7.6256Z"
        fill=${color}
      />
    </svg>
  `
}
