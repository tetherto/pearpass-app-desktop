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
export const SmallArrowIcon = (props) => {
  const { width, height, color } = getIconProps(props)

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 13.0312L5 8.03125L6.0625 6.96875L10 10.9062L13.9375 6.96875L15 8.03125L10 13.0312Z"
        fill=${color}
      />
    </svg>
  `
}
