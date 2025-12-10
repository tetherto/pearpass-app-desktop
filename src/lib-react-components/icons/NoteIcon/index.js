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
export const NoteIcon = (props) => {
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
          d="M8.63081 21.4628V8.45709H21.6308V17.0398L17.2078 21.4628H8.63081ZM20.6308 16.4628H16.6308V20.4628L20.6308 16.4628ZM5.64231 18.2686L3.38281 5.47434L16.1771 3.21484L16.6808 6.07834H6.24831V18.1603L5.64231 18.2686Z"
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
      viewBox="0 0 25 25"
      fill="none"
    >
      <path
        d="M8.63081 21.9199V8.91412H21.6308V17.4969L17.2078 21.9199H8.63081ZM9.63081 20.9199H16.6308V16.9199H20.6308V9.91987H9.63081V20.9199ZM5.64231 18.7256L3.38281 5.93138L16.1771 3.67188L16.6808 6.53537H15.6693L15.3596 4.82363L4.53456 6.74863L6.24631 16.3794V18.6199L5.64231 18.7256Z"
        fill=${color}
      />
    </svg>
  `
}
