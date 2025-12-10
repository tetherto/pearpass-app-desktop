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
export const BrushIcon = (props) => {
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
        d="M2 22.3097V20.3097H22V22.3097H2ZM6 15.1367H7.073L15.873 6.34243L15.3405 5.79043L14.7943 5.26343L6 14.0634V15.1367ZM5 16.1367V13.6367L16.952 1.69043L19.4405 4.19618L7.5 16.1367H5ZM15.873 6.34243L15.3405 5.79043L14.7943 5.26343L15.873 6.34243Z"
        fill=${color}
      />
    </svg>
  `
}
