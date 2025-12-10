import { checkFilledValueType } from './checkFilledValueType'

describe('checkFilledValueType', () => {
  describe('type = "boolean"', () => {
    it('should return false for boolean values', () => {
      expect(checkFilledValueType(true, 'boolean')).toBe(false)
      expect(checkFilledValueType(false, 'boolean')).toBe(false)
    })

    it('should return true for non-boolean values', () => {
      expect(checkFilledValueType('true', 'boolean')).toBe(true)
      expect(checkFilledValueType(1, 'boolean')).toBe(true)
      expect(checkFilledValueType({}, 'boolean')).toBe(true)
      expect(checkFilledValueType([], 'boolean')).toBe(true)
    })
  })

  describe('type = "string"', () => {
    it('should return false for string values', () => {
      expect(checkFilledValueType('test', 'string')).toBe(false)
      expect(checkFilledValueType('', 'string')).toBe(false)
    })

    it('should return true for non-string values', () => {
      expect(checkFilledValueType(123, 'string')).toBe(true)
      expect(checkFilledValueType(true, 'string')).toBe(true)
      expect(checkFilledValueType({}, 'string')).toBe(true)
      expect(checkFilledValueType([], 'string')).toBe(true)
    })
  })

  describe('type = "number"', () => {
    it('should return false for number values', () => {
      expect(checkFilledValueType(123, 'number')).toBe(false)
      expect(checkFilledValueType(0, 'number')).toBe(false)
      expect(checkFilledValueType(NaN, 'number')).toBe(false)
    })

    it('should return true for non-number values', () => {
      expect(checkFilledValueType('123', 'number')).toBe(true)
      expect(checkFilledValueType(true, 'number')).toBe(true)
      expect(checkFilledValueType({}, 'number')).toBe(true)
      expect(checkFilledValueType([], 'number')).toBe(true)
    })
  })

  describe('type = "array"', () => {
    it('should return true for non-array values', () => {
      expect(checkFilledValueType('test', 'array')).toBe(true)
      expect(checkFilledValueType(123, 'array')).toBe(true)
      expect(checkFilledValueType(true, 'array')).toBe(true)
      expect(checkFilledValueType({}, 'array')).toBe(true)
    })

    it('should return false for array values', () => {
      expect(checkFilledValueType([], 'array')).toBe(false)
      expect(checkFilledValueType([1, 2, 3], 'array')).toBe(false)
    })
  })

  describe('null and undefined handling', () => {
    it('should return false for null and undefined values regardless of type', () => {
      expect(checkFilledValueType(null, 'boolean')).toBe(false)
      expect(checkFilledValueType(undefined, 'boolean')).toBe(false)
      expect(checkFilledValueType(null, 'string')).toBe(false)
      expect(checkFilledValueType(undefined, 'string')).toBe(false)
      expect(checkFilledValueType(null, 'number')).toBe(false)
      expect(checkFilledValueType(undefined, 'number')).toBe(false)
      expect(checkFilledValueType(null, 'array')).toBe(false)
      expect(checkFilledValueType(undefined, 'array')).toBe(false)
    })
  })
})
