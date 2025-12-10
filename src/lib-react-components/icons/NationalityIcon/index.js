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
export const NationalityIcon = (props) => {
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
        d="M6.774 18.5095V10.5095H7.774V18.5095H6.774ZM11.774 18.5095V10.5095H12.774V18.5095H11.774ZM3.8125 21.5095V20.5095H20.7355V21.5095H3.8125ZM16.774 18.5095V10.5095H17.774V18.5095H16.774ZM3.8125 8.5095V7.66325L12.274 3.625L20.7355 7.66325V8.5095H3.8125ZM6.45475 7.5095H18.0933L12.274 4.7595L6.45475 7.5095Z"
        fill=${color}
      />
    </svg>
  `
}
