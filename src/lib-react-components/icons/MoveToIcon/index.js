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
export const MoveToIcon = (props) => {
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
        d="M3.50684 19.9551V5.95508H10.1031L12.1031 7.95508H21.5068V19.9551H3.50684ZM4.50684 18.9551H20.5068V8.95508H11.7011L9.70109 6.95508H4.50684V18.9551ZM13.8991 14.4551L11.9856 16.3686L12.6933 17.0763L15.8146 13.9551L12.6933 10.8338L11.9856 11.5416L13.8991 13.4551H9.19909V14.4551H13.8991Z"
        fill=${color}
      />
    </svg>
  `
}
