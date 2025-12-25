import { html } from 'htm/react'

import { SwitchWithLabel } from '../../../../components/SwitchWithLabel'

/**
 * @param {{
 *  rules: Array<{
 *  label: string,
 *  name: string
 *  }>
 *  setRules: () => void,
 *  selectedRules: Record<string, boolean>,
 *  isSwitchFirst?: boolean,
 *  stretch?: boolean
 * }} props
 */
export const RuleSelector = ({
  rules,
  selectedRules,
  setRules,
  isSwitchFirst = false,
  stretch = true
}) => {
  const isAllRuleSelected = Object.values(selectedRules).every(
    (value) => value === true
  )

  const handleSwitchToggle = (ruleName) => {
    const updatedRules = { ...selectedRules }

    if (ruleName === 'all') {
      Object.keys(updatedRules).forEach((rule) => {
        updatedRules[rule] = !isAllRuleSelected
      })
    } else {
      updatedRules[ruleName] = !updatedRules[ruleName]
    }

    setRules(updatedRules)
  }

  return html`${rules.map(
    (rule) =>
      html`<${SwitchWithLabel}
        label=${rule.label}
        description=${rule.description}
        isSwitchFirst=${isSwitchFirst}
        isOn=${selectedRules[rule.name] || isAllRuleSelected}
        onChange=${() => handleSwitchToggle(rule.name)}
        isLabelBold
        stretch=${stretch}
        testId=${`ruleselector-switchwithlabel-${rule.name}`}
      />`
  )} `
}
