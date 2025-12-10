import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { ToastContainer, ToastStack } from './styles'

/**
 * @param {{
 *  toasts: Array.<{
 *    message: string
 *    icon: import('react').ReactNode
 *  }>
 * }} props
 */
export const Toasts = ({ toasts }) => html`
  <${ToastStack}>
    ${toasts?.map((toast) => {
      const Icon = toast.icon
      return html`
        <${ToastContainer}>
          ${Icon && html`<${Icon} color=${colors.black.mode1} />`}
          ${toast.message}
        <//>
      `
    })}
  <//>
`
