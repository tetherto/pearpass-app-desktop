import { html } from 'htm/react'

/**
 * PearLogo SVG component
 * @param {{
 *  width?: string
 *  height?: string
 *  color?: string
 * }} props
 */
export const PearLogo = ({
  width = '35',
  height = '48',
  color = '#B0D944'
}) => html`
  <svg
    width=${width}
    height=${height}
    viewBox="0 0 35 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.25 0H18.75V4.65848H16.25V0Z" fill=${color} />
    <path
      d="M15 6.13268V7.07617H12.5V8.25553H22.5V7.07617H20V5.24816H17.5V6.13268H15Z"
      fill=${color}
    />
    <path d="M25 8.84522H17.5V9.72974H10V11.8526H25V8.84522Z" fill=${color} />
    <path
      d="M27.5 12.4423H17.5V13.3268H7.50002V15.4497H27.5V12.4423Z"
      fill=${color}
    />
    <path
      d="M27.5 16.0394H17.5V16.9239H7.50002V19.0467H27.5V16.0394Z"
      fill=${color}
    />
    <path
      d="M30 19.6364H17.5V20.5209H5.00002V22.6438H30V19.6364Z"
      fill=${color}
    />
    <path
      d="M30 23.2335H17.5V24.118H5.00002V26.2409H30V23.2335Z"
      fill=${color}
    />
    <path
      d="M32.5 26.8305H17.5V27.7151H2.5V29.8379H32.5V26.8305Z"
      fill=${color}
    />
    <path d="M35 30.4276H17.5V31.3121H0V33.435H35V30.4276Z" fill=${color} />
    <path d="M35 34.0246H17.5V34.9092H0V37.032H35V34.0246Z" fill=${color} />
    <path d="M35 37.6217H17.5V38.5062H0V40.6291H35V37.6217Z" fill=${color} />
    <path
      d="M30 41.2188H17.5V42.1033H5.00002V44.2261H30V41.2188Z"
      fill=${color}
    />
    <path d="M25 44.8158H17.5V45.7003H10V47.1745H25V44.8158Z" fill=${color} />
  </svg>
`
