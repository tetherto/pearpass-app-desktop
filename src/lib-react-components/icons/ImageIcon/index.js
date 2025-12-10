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
export const ImageIcon = (props) => {
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
        d="M8 17H17.1538L14.327 13.2308L11.7115 16.5385L9.9615 14.423L8 17ZM4.5 20.5V4.5H20.5V20.5H4.5ZM5.5 19.5H19.5V5.5H5.5V19.5ZM8.99775 10C9.27492 10 9.51125 9.903 9.70675 9.709C9.90225 9.515 10 9.27942 10 9.00225C10 8.72508 9.903 8.48875 9.709 8.29325C9.515 8.09775 9.27942 8 9.00225 8C8.72508 8 8.48875 8.097 8.29325 8.291C8.09775 8.485 8 8.72058 8 8.99775C8 9.27492 8.097 9.51125 8.291 9.70675C8.485 9.90225 8.72058 10 8.99775 10Z"
        fill=${color}
      />
    </svg>
  `
}
