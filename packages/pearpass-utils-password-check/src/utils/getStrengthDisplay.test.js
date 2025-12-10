import { PASSWORD_STRENGTH } from '../constants'
import { getStrengthDisplay } from './getStrengthDisplay'

describe('passwordStrength utils', () => {
  describe('getStrengthDisplay', () => {
    it('returns correct config for all strength levels', () => {
      const vulnerableResult = getStrengthDisplay(PASSWORD_STRENGTH.VULNERABLE)
      expect(vulnerableResult).toEqual({
        text: 'Vulnerable',
        type: 'error'
      })

      const weakResult = getStrengthDisplay(PASSWORD_STRENGTH.WEAK)
      expect(weakResult).toEqual({
        text: 'Weak',
        type: 'warning'
      })

      const safeResult = getStrengthDisplay(PASSWORD_STRENGTH.SAFE)
      expect(safeResult).toEqual({
        text: 'Safe',
        type: 'success'
      })
    })

    it('returns null for invalid strength', () => {
      expect(getStrengthDisplay('invalid')).toBeNull()
      expect(getStrengthDisplay(null)).toBeNull()
    })
  })
})
