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
export const ArrowUpIcon = (props) => {
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
        d="M3.17234 16.3761L12.4801 7.06836L21.7878 16.3761L20.7243 17.4396L12.4801 9.19536L4.23584 17.4396L3.17234 16.3761Z"
        fill=${color}
      />
    </svg>
  `
}
