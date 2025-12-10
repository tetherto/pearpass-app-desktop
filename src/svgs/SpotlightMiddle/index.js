import { html } from 'htm/react'

/**
 * @param {{
 *  width?: string
 *  height?: string
 *  fill?: string
 * }} props
 */
export const SpotlightMiddle = ({
  fill = 'none',
  height = '100%',
  width = '100%'
}) => html`
  <svg
    width=${width}
    height=${height}
    viewBox="0 0 632 792"
    fill=${fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_f_7001_17047)">
      <circle
        cx="396.349"
        cy="396"
        r="195.83"
        fill="#F2CB40"
        fillOpacity="0.24"
      />
    </g>
    <defs>
      <filter
        id="filter0_f_7001_17047"
        x="0.519043"
        y="0.169922"
        width="791.66"
        height="791.66"
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
          result="effect1_foregroundBlur_7001_17047"
        />
      </filter>
    </defs>
  </svg>
`
