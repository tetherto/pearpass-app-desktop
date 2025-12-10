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
export const NewFolderIcon = (props) => {
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
        d="M3.50684 19.0254V5.02539H10.1031L12.1031 7.02539H21.5068V19.0254H3.50684ZM4.50684 18.0254H20.5068V8.02539H11.6976L9.70109 6.02539H4.50684V18.0254ZM15.0068 15.5254H16.0068V13.5254H18.0068V12.5254H16.0068V10.5254H15.0068V12.5254H13.0068V13.5254H15.0068V15.5254Z"
        fill=${color}
      />
    </svg>
  `
}
