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
export const CommonFileIcon = (props) => {
  const { width, height, color } = getIconProps(props)

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 24 25"
      fill="none"
    >
      <path
        d="M8.3845 12.8077H15.6155V11.8077H8.3845V12.8077ZM8.3845 15.577H15.6155V14.577H8.3845V15.577ZM8.3845 18.3462H12.6155V17.3462H8.3845V18.3462ZM5 21.5V3.5H14.5L19 8V21.5H5ZM14 8.5V4.5H6V20.5H18V8.5H14Z"
        fill=${color}
      />
    </svg>
  `
}
