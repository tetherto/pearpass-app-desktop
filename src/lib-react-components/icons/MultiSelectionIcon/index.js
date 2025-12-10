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
export const MultiSelectionIcon = (props) => {
  const { width, height, color } = getIconProps(props)

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6.69994 17.3107L1.74219 12.353L2.45569 11.6452L6.70569 15.8952L7.39794 15.203L8.10569 15.9107L6.69994 17.3107ZM12.3499 17.3107L7.39219 12.353L8.09994 11.6395L12.3499 15.8895L21.5499 6.68945L22.2577 7.40295L12.3499 17.3107ZM11.6577 12.353L10.9442 11.6452L15.8942 6.6952L16.6077 7.40295L11.6577 12.353Z"
        fill=${color}
      />
    </svg>
  `
}
