import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { getIconProps } from '../../utils/getIconProps'

/**
 * @param {{
 *  size?: string;
 *  width?: string;
 *  height?: string;
 *  color?: string;
 * }} props
 */
export const ErrorIcon = (props) => {
  const { width, height } = getIconProps({
    ...props,
    color: props.color || colors.errorRed.mode1
  })

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19Z"
        fill=${colors.errorRed.dark}
        stroke=${colors.errorRed.mode1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.2984 4.64795L11.0613 11.97H8.94356L8.70653 4.64795H11.2984ZM9.99986 15.3502C9.6323 15.3502 9.31627 15.2196 9.05176 14.9585C8.79069 14.6975 8.66016 14.3814 8.66016 14.0104C8.66016 13.6463 8.79069 13.3354 9.05176 13.0778C9.31627 12.8167 9.6323 12.6862 9.99986 12.6862C10.3537 12.6862 10.6646 12.8167 10.9325 13.0778C11.2039 13.3354 11.3396 13.6463 11.3396 14.0104C11.3396 14.2578 11.276 14.4828 11.1489 14.6855C11.0253 14.8881 10.8621 15.0496 10.6594 15.1698C10.4602 15.29 10.2403 15.3502 9.99986 15.3502Z"
        fill=${colors.white.mode1}
      />
    </svg>
  `
}
