import { html } from 'htm/react'

import { CardSingleSetting } from '../../../../components/CardSingleSetting'
import { Select } from '../../../../components/Select'

/**
 * @param {{
 *    selectedItem?: { label: string },
 *    languageOptions: Array<{ label: string, value: string }>,
 *    onItemSelect: (item: { label: string, value: string }) => void,
 *    placeholder: string
 *    title: string
 *  }} props
 */
export const SettingsLanguageSection = ({
  selectedItem,
  onItemSelect,
  placeholder,
  title,
  languageOptions = []
}) => html`
  <${CardSingleSetting} title=${title}>
    <${Select}
      items=${languageOptions}
      selectedItem=${selectedItem}
      onItemSelect=${onItemSelect}
      placeholder=${placeholder}
    />
  <//>
`
