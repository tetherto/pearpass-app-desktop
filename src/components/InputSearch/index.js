import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { Container, IconWrapper, Input, QuantityWrapper } from './styles'
import { LockCircleIcon } from '../../lib-react-components'

/**
 * @param {{
 *  value: string
 *  onChange: (event: import('react').ChangeEvent<HTMLInputElement>) => void
 *  quantity?: number
 * }} props
 */
export const InputSearch = ({ value, onChange, quantity }) => {
  const { i18n } = useLingui()
  return html`
    <${Container}>
      <${IconWrapper}>
        <${LockCircleIcon} />
      <//>
      <${Input}
        placeholder=${i18n._('Search...')}
        value=${value}
        onChange=${onChange}
      />
      <${QuantityWrapper}>${value?.length ? quantity : null}<//>
    <//>
  `
}
