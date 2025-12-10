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
export const SaveIcon = (props) => {
  const { width, height, color } = getIconProps(props)

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 25 24"
      fill="none"
    >
      <path
        d="M20.5 7.423V20H4.5V4H17.077L20.5 7.423ZM19.5 7.85L16.65 5H5.5V19H19.5V7.85ZM12.4955 16.5385C13.0498 16.5385 13.5225 16.3445 13.9135 15.9565C14.3045 15.5685 14.5 15.0973 14.5 14.543C14.5 13.9887 14.306 13.516 13.918 13.125C13.53 12.734 13.0588 12.5385 12.5045 12.5385C11.9502 12.5385 11.4775 12.7325 11.0865 13.1205C10.6955 13.5085 10.5 13.9797 10.5 14.534C10.5 15.0883 10.694 15.561 11.082 15.952C11.47 16.343 11.9412 16.5385 12.4955 16.5385ZM7.26925 9.76925H14.6923V6.76925H7.26925V9.76925Z"
        fill=${color}
      />
    </svg>
  `
}
