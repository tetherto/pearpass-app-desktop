import { html } from 'htm/react'

/**
 * @param {{
 *  width?: string
 *  height?: string
 *  fill?: string
 * }} props
 */
export const SpotlightRight = ({
  fill = 'none',
  height = '100%',
  width = '100%'
}) => html`
  <svg
    width=${width}
    height=${height}
    viewBox="0 0 518 541"
    fill=${fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_f_7001_17046)">
      <circle
        cx="715.95"
        cy="-175.581"
        r="515.731"
        fill="#B0D944"
        fillOpacity="0.3"
      />
    </g>
    <defs>
      <filter
        id="filter0_f_7001_17046"
        x="0.21875"
        y="-891.312"
        width="1431.46"
        height="1431.46"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="100"
          result="effect1_foregroundBlur_7001_17046"
        />
      </filter>
    </defs>
  </svg>
`
