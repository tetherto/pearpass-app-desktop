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

export const PassPhraseIcon = (props) => {
  const { width, height, color, fill } = getIconProps(props)
  if (fill) {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width=${width}
        height=${height}
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d="M8 16.7856H14V15.7856H8V16.7856ZM8 12.7856H17V11.7856H8V12.7856ZM8 8.78564H17V7.78564H8V8.78564ZM4.5 20.2856V4.28564H20.5V20.2856H4.5Z"
          fill=${color}
        />
      </svg>
    `
  }
  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 25 24"
      fill="none"
    >
      <path
        d="M8.29688 16.5H14.2969V15.5H8.29688V16.5ZM8.29688 12.5H17.2969V11.5H8.29688V12.5ZM8.29688 8.5H17.2969V7.5H8.29688V8.5ZM4.79688 20V4H20.7969V20H4.79688ZM5.79688 19H19.7969V5H5.79688V19Z"
        fill=${color}
      />
    </svg>
  `
}
