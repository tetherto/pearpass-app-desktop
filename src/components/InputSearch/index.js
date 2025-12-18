import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { Container, IconWrapper, Input, QuantityWrapper } from './styles'
import { LockCircleIcon } from '../../lib-react-components'

/**
 * @param {{
 *  value: string
 *  onChange: (event: import('react').ChangeEvent<HTMLInputElement>) => void
 *  quantity?: number
 *  testId?: string
 * }} props
 */
export const InputSearch = ({ value, onChange, quantity, testId }) => {
  const { i18n } = useLingui()
  return html`
    <${Container}>
      <${IconWrapper}>
        <${LockCircleIcon} />
      <//>
      <${Input}
        data-testid=${testId}
        placeholder=${i18n._('Search...')}
        value=${value}
        onChange=${onChange}
      />
      <${QuantityWrapper}>${value?.length ? quantity : null}<//>
    <//>
  `
}
