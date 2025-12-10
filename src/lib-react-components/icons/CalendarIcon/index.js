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
export const CalendarIcon = (props) => {
  const { width, height, color } = getIconProps(props)

  return html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width=${width}
      height=${height}
      viewBox="0 0 25 24"
      fill="none"
    >
      <path
        d="M11.7308 14.2691V12.7309H13.2692V14.2691H11.7308ZM7.73075 14.2691V12.7309H9.26925V14.2691H7.73075ZM15.7308 14.2691V12.7309H17.2693V14.2691H15.7308ZM11.7308 18.1154V16.5769H13.2692V18.1154H11.7308ZM7.73075 18.1154V16.5769H9.26925V18.1154H7.73075ZM15.7308 18.1154V16.5769H17.2693V18.1154H15.7308ZM4.5 21.1154V5.11539H7.8845V2.88464H8.9615V5.11539H16.1155V2.88464H17.1155V5.11539H20.5V21.1154H4.5ZM5.5 20.1154H19.5V10.7309H5.5V20.1154ZM5.5 9.73064H19.5V6.11539H5.5V9.73064Z"
        fill=${color}
      />
    </svg>
  `
}
