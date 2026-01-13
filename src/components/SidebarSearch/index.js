import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { SearchInput, SearchLabelIcon, SidebarSearchContainer } from './styles'
import { SearchIcon } from '../../lib-react-components'

/**
 * @param {{
 *  value: string
 *  onChange: (value: string) => void
 *  testId?: string
 * }} props
 */
export const SidebarSearch = ({ value, onChange, testId }) => {
  const { i18n } = useLingui()

  const handleSearch = (e) => {
    onChange(e.target.value)
  }

  return html`
    <${SidebarSearchContainer}>
      <${SearchLabelIcon}>
        <${SearchIcon} size="24" />
      <//>

      <${SearchInput}
        data-testid=${testId}
        type="search"
        value=${value}
        onChange=${handleSearch}
        placeholder=${i18n._('Search...')}
      />
    <//>
  `
}
