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
export const ExitIcon = (props) => {
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
        d="M4.18164 20.2856V4.28564H12.2009V5.28564H5.18164V19.2856H12.2009V20.2856H4.18164ZM16.6431 15.8241L15.9411 15.1049L18.2604 12.7856H9.37389V11.7856H18.2604L15.9411 9.46639L16.6431 8.74715L20.1816 12.2856L16.6431 15.8241Z"
        fill=${color}
      />
    </svg>
  `
}
