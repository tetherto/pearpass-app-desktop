import { PASSWORD_STRENGTH } from './constants'
import { getPassStrength } from './utils/getPassStrength'
import { getStrengthDisplay } from './utils/getStrengthDisplay'

/**
 * @param {string} password
 * @param {Object} [config={}]
 * @param {Object} [config.rules={}]
 * @param {number} [config.rules.length=8]
 * @param {boolean} [config.rules.includeSpecialChars=true]
 * @param {boolean} [config.rules.lowerCase=true]
 * @param {boolean} [config.rules.upperCase=true]
 * @param {boolean} [config.rules.numbers=true]
 * @param {Object} [config.errors={}]
 * @returns {{
 *  success: boolean,
 *  type: 'vulnerable' | 'weak' | 'safe',
 *  strengthType: 'error' | 'warning' | 'success',
 *  strengthText: string,
 *  rules: Record<string, boolean>,
 *  errors: string[]
 * }}
 */
export const checkPasswordStrength = (password, config = {}) => {
  const { rules = {}, errors = {} } = config

  const {
    length = 8,
    includeSpecialChars = true,
    lowerCase = true,
    upperCase = true,
    numbers = true
  } = rules

  const rulesCheck = {
    minLength: password.length >= length,
    hasLowerCase: lowerCase ? /[a-z]/.test(password) : true,
    hasUpperCase: upperCase ? /[A-Z]/.test(password) : true,
    hasNumbers: numbers ? /\d/.test(password) : true,
    hasSymbols: includeSpecialChars
      ? /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)
      : true
  }

  const failedRules = Object.keys(rulesCheck).filter(
    (rule) => !rulesCheck[rule]
  )
  const errorMessages = failedRules.map((rule) => errors[rule])
  const type = getPassStrength(rulesCheck)
  const strengthDisplay = getStrengthDisplay(type)

  return {
    success: type === PASSWORD_STRENGTH.SAFE && errorMessages.length === 0,
    type,
    strengthType: strengthDisplay.type,
    strengthText: strengthDisplay.text,
    rules: rulesCheck,
    errors: errorMessages
  }
}
