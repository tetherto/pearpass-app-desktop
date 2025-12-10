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
export const PhoneIcon = (props) => {
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
        d="M12.0466 6.56166C12.2649 6.56166 12.4475 6.48782 12.5943 6.34016C12.7412 6.19232 12.8146 6.00924 12.8146 5.79091C12.8146 5.57257 12.7408 5.39007 12.5931 5.24341C12.4453 5.09657 12.2622 5.02316 12.0438 5.02316C11.8255 5.02316 11.643 5.09699 11.4963 5.24466C11.3495 5.39232 11.2761 5.57532 11.2761 5.79366C11.2761 6.01199 11.3499 6.19457 11.4976 6.34141C11.6453 6.48824 11.8283 6.56166 12.0466 6.56166ZM6.00684 22.2539V2.25391H18.0838V7.08466H19.0068V10.7694H18.0838V22.2539H6.00684ZM7.00684 21.2539H17.0838V3.25391H7.00684V21.2539Z"
        fill=${color}
      />
    </svg>
  `
}
