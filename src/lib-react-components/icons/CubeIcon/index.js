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

export const CubeIcon = (props) => {
  const { width, height, color } = getIconProps(props)
  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 17 20"
      fill="none"
    >
      <path
        d="M7.79688 17.7113V10.2843L1.29688 6.52081V13.9478L7.79688 17.7113ZM8.79688 17.7113L15.2969 13.9478V6.52081L8.79688 10.2843V17.7113ZM8.29688 9.42481L14.7219 5.71131L8.29688 1.99781L1.87188 5.71131L8.29688 9.42481ZM0.296875 14.5458V5.44981L8.29688 0.851562L16.2969 5.44981V14.5458L8.29688 19.1441L0.296875 14.5458Z"
        fill=${color}
      />
    </svg>
  `
}
