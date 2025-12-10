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
 *   specialCharacters: boolean,
 *   characters: number
 *  }
 * }} props
 */
export const PasswordGenerator = ({ onRuleChange, rules }) => {
  const { i18n } = useLingui()

  const ruleOptions = [
    { name: 'specialCharacters', label: i18n._('Special character') + ' (!&*)' }
  ]

  const handleRuleChange = (newRules) => {
    onRuleChange('password', { ...rules, ...newRules })
  }

  const handleSliderValueChange = (value) => {
    onRuleChange('password', { ...rules, characters: value })
  }

  const selectableRules = { ...rules }
  delete selectableRules.characters

  return html`
    <${SliderWrapper}>
      <${SliderLabel}> ${rules.characters} ${' '} ${i18n._('characters')} <//>

      <${SliderContainer}>
        <${Slider}
          value=${rules.characters}
          onChange=${handleSliderValueChange}
          min=${4}
          max=${32}
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
