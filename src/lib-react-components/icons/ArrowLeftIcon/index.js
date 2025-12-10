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
export const ArrowLeftIcon = (props) => {
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
        d="M16.4113 21.5608L7.10352 12.2531L16.4113 2.94531L17.4748 4.00881L9.23052 12.2531L17.4748 20.4973L16.4113 21.5608Z"
        fill=${color}
      />
    </svg>
  `
}
