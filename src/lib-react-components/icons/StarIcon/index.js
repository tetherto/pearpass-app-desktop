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
export const StarIcon = (props) => {
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
          d="M8.13251 19.207L9.37301 13.8935L5.24976 10.3225L10.6805 9.8513L12.8075 4.8418L14.9345 9.8513L20.3653 10.3225L16.242 13.8935L17.4825 19.207L12.8075 16.386L8.13251 19.207Z"
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
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M8.85013 17.0846L12.0001 15.1846L15.1501 17.1096L14.3251 13.5096L17.1001 11.1096L13.4501 10.7846L12.0001 7.38463L10.5501 10.7596L6.90013 11.0846L9.67513 13.5096L8.85013 17.0846ZM7.32513 19.1826L8.56563 13.8691L4.44238 10.2981L9.87313 9.82688L12.0001 4.81738L14.1271 9.82688L19.5579 10.2981L15.4346 13.8691L16.6751 19.1826L12.0001 16.3616L7.32513 19.1826Z"
        fill=${color}
      />
    </svg>
  `
}
