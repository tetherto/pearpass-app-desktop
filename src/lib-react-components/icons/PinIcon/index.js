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
export const PinIcon = (props) => {
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
        d="M15.5069 12.5109L17.0839 14.0879V15.0879H13.0069V20.0879L12.5069 20.5879L12.0069 20.0879V15.0879H7.92993V14.0879L9.50693 12.5109V5.08789H8.50693V4.08789H16.5069V5.08789H15.5069V12.5109ZM9.35693 14.0879H15.6569L14.5069 12.9379V5.08789H10.5069V12.9379L9.35693 14.0879Z"
        fill=${color}
      />
    </svg>
  `
}
