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
export const CopyIcon = (props) => {
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
        d="M8.57373 18.0664V4.06641H19.5737V18.0664H8.57373ZM9.57373 17.0664H18.5737V5.06641H9.57373V17.0664ZM5.57373 21.0664V7.68191H6.57373V20.0664H15.9582V21.0664H5.57373Z"
        fill=${color}
      />
    </svg>
  `
}
