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
export const SecurityIcon = (props) => {
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
        d="M12 20.9431C9.991 20.3469 8.32208 19.1299 6.99325 17.2921C5.66442 15.4543 5 13.3841 5 11.0816V5.67384L12 3.05859L19 5.67384V11.0816C19 13.3841 18.3356 15.4543 17.0068 17.2921C15.6779 19.1299 14.009 20.3469 12 20.9431ZM12 19.8816C13.7333 19.3316 15.1667 18.2316 16.3 16.5816C17.4333 14.9316 18 13.0983 18 11.0816V6.35659L12 4.12584L6 6.35659V11.0816C6 13.0983 6.56667 14.9316 7.7 16.5816C8.83333 18.2316 10.2667 19.3316 12 19.8816Z"
        fill=${color}
      />
    </svg>
  `
}
