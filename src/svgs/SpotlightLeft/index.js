import { html } from 'htm/react'

/**
 * @param {{
 *  width?: string
 *  height?: string
 *  fill?: string
 * }} props
 */
export const SpotLightLeft = ({
  fill = 'none',
  height = '100%',
  width = '100%'
}) => html`
  <svg
    width=${width}
    height=${height}
    viewBox="0 0 453 752"
    fill=${fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_f_7001_17048)">
      <path
        d="M67.3396 592.874C152.858 791.154 321.5 880.851 222.19 923.684C122.879 966.517 -26.9543 840.503 -112.473 642.223C-197.991 443.944 -186.81 248.483 -87.4998 205.65C11.8108 162.817 -18.1789 394.594 67.3396 592.874Z"
        fill="#F2CB40"
        fillOpacity="0.35"
      />
    </g>
    <defs>
      <filter
        id="filter0_f_7001_17048"
        x="-369.959"
        y="0.483398"
        width="822.535"
        height="1131.56"
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
          result="effect1_foregroundBlur_7001_17048"
        />
      </filter>
    </defs>
  </svg>
`
