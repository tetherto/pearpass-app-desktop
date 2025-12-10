import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { Slider } from '../../../../lib-react-components'
import { RuleSelector } from '../RuleSelector'
import {
  SliderContainer,
  SliderLabel,
  SliderWrapper,
  SwitchWrapper
} from '../styles'

/**
 * @param {{
 *  onRuleChange: (optionName: string, value: any) => void
 *  rules: {
 *   capitalLetters: boolean,
 *   symbols: boolean,
 *   numbers: boolean,
 *   words: number
 *  }
 * }} props
 */
export const PassphraseGenerator = ({ onRuleChange, rules }) => {
  const { i18n } = useLingui()

  const ruleOptions = [
    { name: 'all', label: i18n._('Select All') },
    { name: 'capitalLetters', label: i18n._('Capital Letters') },
    { name: 'symbols', label: i18n._('Symbols') },
    { name: 'numbers', label: i18n._('Numbers') }
  ]

  const handleRuleChange = (newRules) => {
    onRuleChange('passphrase', { ...rules, ...newRules })
  }

  const handleSliderValueChange = (value) => {
    onRuleChange('passphrase', { ...rules, words: value })
  }

  const selectableRules = { ...rules }
  delete selectableRules.words

  return html`
    <${SliderWrapper}>
      <${SliderLabel}> ${rules.words} ${' '} ${i18n._('words')} <//>

      <${SliderContainer}>
        <${Slider}
          value=${rules.words}
          onChange=${handleSliderValueChange}
          min=${6}
          max=${36}
          step=${1}
        />
      <//>
    <//>

    <${SwitchWrapper}>
      <${RuleSelector}
        rules=${ruleOptions}
        selectedRules=${selectableRules}
        setRules=${handleRuleChange}
      />
    <//>
  `
}
