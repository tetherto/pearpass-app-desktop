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
export const ArrowRightIcon = (props) => {
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
        d="M8.38479 21.9202L7.32129 20.8567L15.5655 12.6124L7.32129 4.36819L8.38479 3.30469L17.6925 12.6124L8.38479 21.9202Z"
        fill=${color}
      />
    </svg>
  `
}
