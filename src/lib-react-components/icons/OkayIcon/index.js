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
export const OkayIcon = (props) => {
  const { width, height } = getIconProps({
    ...props,
    color: props.color || colors.primary400.mode1
  })

  return html`
    <svg
      width=${width}
      height=${height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        fill=${colors.primary300.mode1}
        stroke=${colors.primary400.mode1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.311 16.1445L6.38184 12.2154L7.36412 11.2331L10.311 14.18L16.6355 7.85547L17.6177 8.83775L10.311 16.1445Z"
        fill=${colors.white.mode1}
      />
    </svg>
  `
}
