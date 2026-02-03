import { useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { useLanguageOptions } from '../../../hooks/useLanguageOptions'
import { SettingsLanguageSection } from '../SettingsTab/SettingsLanguageSection'

export const AppearanceContent = () => {
  const { i18n } = useLingui()

  const [language, setLanguage] = useState(i18n.locale)
  const { languageOptions } = useLanguageOptions()

  const handleLanguageChange = async (selected) => {
    await setLanguage(() => selected.value)
    i18n.activate(selected.value)
  }

  const selectedLangItem = languageOptions.find((l) => l.value === language)

  return html`
    <${SettingsLanguageSection}
      selectedItem=${selectedLangItem}
      onItemSelect=${handleLanguageChange}
      placeholder=${i18n._('Select')}
      title=${i18n._('Language')}
      description=${i18n._('Choose the language of the app.')}
      languageOptions=${languageOptions}
    />
  `
}
