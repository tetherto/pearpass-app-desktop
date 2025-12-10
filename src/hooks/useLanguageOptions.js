import { useMemo } from 'react'

import { useLingui } from '@lingui/react'
import { LANGUAGES } from 'pearpass-lib-constants'

export const useLanguageOptions = () => {
  const { i18n } = useLingui()

  const languageOptions = useMemo(() => {
    const languageLabelByValue = {
      en: i18n._('English'),
      it: i18n._('Italian'),
      es: i18n._('Spanish'),
      fr: i18n._('French')
    }

    return LANGUAGES.map((lang) => ({
      label: languageLabelByValue[lang.value],
      value: lang.value
    }))
  }, [LANGUAGES, i18n])

  return {
    languageOptions
  }
}
