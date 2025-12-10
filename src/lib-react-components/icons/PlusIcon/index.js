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
export const PlusIcon = (props) => {
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
        d="M11.6816 20.2856V12.7856H4.18164V11.7856H11.6816V4.28564H12.6816V11.7856H20.1816V12.7856H12.6816V20.2856H11.6816Z"
        fill=${color}
      />
    </svg>
  `
}
