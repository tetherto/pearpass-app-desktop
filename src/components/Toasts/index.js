import { Snackbar } from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'

import { ToastStack } from './styles'

/**
 * @param {{
 *  toasts: Array.<{
 *    message: string
 *    icon?: import('react').ElementType
 *  }>
 * }} props
 */
export const Toasts = ({ toasts }) => html`
  <${ToastStack}>
    ${toasts?.map((toast, index) => {
      const Icon = toast.icon
      return html`
        <${Snackbar}
          key=${index}
          text=${toast.message}
          icon=${Icon ? html`<${Icon} />` : undefined}
        />
      `
    })}
  <//>
`
