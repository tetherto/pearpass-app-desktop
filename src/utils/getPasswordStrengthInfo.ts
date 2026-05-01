import {
  checkPassphraseStrength,
  checkPasswordStrength
} from '@tetherto/pearpass-utils-password-check'
import { PassType } from '../shared/types'

type StrengthResult = {
  type: string
  strengthType: string
  strengthText: string
}

function computeStrengthResult(
  value: string | string[],
  passType: PassType.Password | PassType.PassPhrase
): StrengthResult | null {
  if (!value?.length) return null

  if (passType === PassType.Password) {
    return checkPasswordStrength(value as string) as StrengthResult
  }

  const words = Array.isArray(value) ? value : value.split('-')
  return checkPassphraseStrength(words) as StrengthResult
}

export function getPasswordStrength(
  value: string | string[],
  passType: PassType.Password | PassType.PassPhrase = PassType.Password
) {
  const result = computeStrengthResult(value, passType)
  if (!result) return null

  return result
}
