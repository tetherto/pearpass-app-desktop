import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { PASSPHRASE_TYPE_OPTIONS } from 'pearpass-lib-constants'

import {
  PassPraseSettingsContainer,
  PassPraseSettingsRandomWordContainer,
  PassPraseSettingsRandomWordText,
  SwitchWrapper
} from './styles'
import { RadioSelect } from '../../components/RadioSelect'
import { SwitchWithLabel } from '../../components/SwitchWithLabel'

/**
 * @param {{
 *   selectedType: number,
 *   setSelectedType: (value: number) => void,
 *   withRandomWord: boolean,
 *   setWithRandomWord: (value: boolean) => void,
 *   isDisabled: boolean,
 *   testId?: string
 * }} props
 */
export const PassPhraseSettings = ({
  selectedType,
  setSelectedType,
  withRandomWord,
  setWithRandomWord,
  isDisabled,
  testId
}) => {
  const { i18n } = useLingui()

  return html`
    <${PassPraseSettingsContainer} data-testid=${testId}>
      <${RadioSelect}
        title=${i18n._('Type')}
        options=${PASSPHRASE_TYPE_OPTIONS.map((option) => ({
          label: i18n._('{count} words', { count: option.value }),
          value: option.value
        }))}
        selectedOption=${selectedType}
        onChange=${(value) => setSelectedType(value)}
        optionStyle=${{ fontSize: 12, fontWeight: 400 }}
        titleStyle=${{ fontSize: 12, marginBottom: 5, fontWeight: 500 }}
        disabled=${isDisabled}
      />

      <${PassPraseSettingsRandomWordContainer}>
        <${PassPraseSettingsRandomWordText}>${i18n._('+1 random word')}<//>
        <${SwitchWrapper}>
          <${SwitchWithLabel}
            testId="passphrasesettings-switchwithlabel"
            isOn=${withRandomWord}
            onChange=${(value) => setWithRandomWord(value)}
            disabled=${isDisabled}
          />
        <//>
      <//>
    <//>
  `
}
