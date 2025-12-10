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
export const DeleteIcon = (props) => {
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
        d="M6 20.3847V6.38473H5V5.38473H9V4.61548H15V5.38473H19V6.38473H18V20.3847H6ZM7 19.3847H17V6.38473H7V19.3847ZM9.80775 17.3847H10.8078V8.38473H9.80775V17.3847ZM13.1923 17.3847H14.1923V8.38473H13.1923V17.3847Z"
        fill=${color}
      />
    </svg>
  `
}
