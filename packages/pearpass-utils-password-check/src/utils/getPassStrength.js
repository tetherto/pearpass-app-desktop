import { PASSWORD_STRENGTH } from '../constants'

/**
 * @param {{[key: string]: boolean}} rulesCheck
 * @returns {'vulnerable' | 'weak' | 'safe'}
 */
export const getPassStrength = (rulesCheck) => {
  const passedRulesCount = Object.values(rulesCheck).filter(Boolean).length

  if (passedRulesCount < 4) {
    return PASSWORD_STRENGTH.VULNERABLE
  }

  if (passedRulesCount === 4) {
    return PASSWORD_STRENGTH.WEAK
  }

  return PASSWORD_STRENGTH.SAFE
}
