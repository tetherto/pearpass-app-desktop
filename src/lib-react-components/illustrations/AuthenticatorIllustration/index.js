import { html } from 'htm/react'

/**
 * @param {{
 *  width?: string;
 *  height?: string;
 * }} props
 */
export const AuthenticatorIllustration = ({
  width = '300',
  height = '190'
}) => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width=${width}
    height=${height}
    viewBox="0 0 300 190"
    fill="none"
  >
    <defs>
      <linearGradient id="authIllCardBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#212814" />
        <stop offset="50%" stop-color="#15180e" />
      </linearGradient>
      <linearGradient id="authIllFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="47%" stop-color="#15180e" stop-opacity="0" />
        <stop offset="100%" stop-color="#15180e" />
      </linearGradient>
      <clipPath id="authIllClip">
        <rect width="300" height="190" rx="10" />
      </clipPath>
    </defs>
    <g clip-path="url(#authIllClip)">
      <rect
        x="44"
        y="9"
        width="212"
        height="300"
        rx="25"
        fill="url(#authIllCardBg)"
      />

      <rect x="52" y="46" width="196" height="37" rx="5" fill="#2c3618" />
      <rect x="60" y="54" width="21" height="21" rx="5" fill="#37431d" />
      <rect x="89" y="55" width="76" height="9" rx="4" fill="#37431d" />
      <rect x="89" y="66" width="51" height="9" rx="4" fill="#37431d" />

      <rect x="52" y="88" width="196" height="37" rx="5" fill="#2c3618" />
      <rect x="60" y="96" width="21" height="21" rx="5" fill="#37431d" />
      <rect x="89" y="97" width="66" height="9" rx="4" fill="#37431d" />
      <rect x="89" y="108" width="60" height="9" rx="4" fill="#37431d" />

      <rect x="52" y="130" width="196" height="37" rx="5" fill="#2c3618" />
      <rect x="60" y="138" width="21" height="21" rx="5" fill="#37431d" />
      <rect x="89" y="139" width="88" height="9" rx="4" fill="#37431d" />
      <rect x="89" y="150" width="74" height="9" rx="4" fill="#37431d" />

      <rect x="52" y="172" width="196" height="37" rx="5" fill="#2c3618" />
      <rect x="60" y="180" width="21" height="21" rx="5" fill="#37431d" />
      <rect x="89" y="181" width="76" height="9" rx="4" fill="#37431d" />
      <rect x="89" y="192" width="51" height="9" rx="4" fill="#37431d" />

      <rect width="300" height="190" fill="url(#authIllFade)" />
    </g>
  </svg>
`
