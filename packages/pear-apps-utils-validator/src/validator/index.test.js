import { Validator } from './index'
import { addHttps } from '../utils/addHttps'
import { checkFilledValueType } from '../utils/checkFilledValueType'
import { isEmpty } from '../utils/isEmpty'

jest.mock('../utils/isEmpty')
jest.mock('../utils/addHttps')
jest.mock('../utils/checkFilledValueType')

describe('Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    isEmpty.mockImplementation(
      (value) =>
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
    )
    checkFilledValueType.mockImplementation(() => null)
  })

  describe('Constructor and static methods', () => {
    test('constructor should set the correct type', () => {
      const validator = new Validator('string')
      expect(validator.type).toBe('string')
      expect(validator.validations).toEqual([])
      expect(validator.itemSchema).toBeNull()
    })

    test('static string() should return a validator of type string', () => {
      const validator = Validator.string()
      expect(validator.type).toBe('string')
    })

    test('static number() should return a validator of type number', () => {
      const validator = Validator.number()
      expect(validator.type).toBe('number')
    })

    test('static boolean() should return a validator of type boolean', () => {
      const validator = Validator.boolean()
      expect(validator.type).toBe('boolean')
    })

    test('static array() should return a validator of type array', () => {
      const validator = Validator.array()
      expect(validator.type).toBe('array')
    })
  })

  describe('required()', () => {
    test('should validate required fields', () => {
      const validator = Validator.string().required()

      isEmpty.mockReturnValueOnce(true)
      expect(validator.validate('')).toBe('This field is required')

      isEmpty.mockReturnValueOnce(false)
      expect(validator.validate('test')).toBeNull()
    })

    test('should accept custom error message', () => {
      const customMsg = 'Field cannot be empty'
      const validator = Validator.string().required(customMsg)

      isEmpty.mockReturnValueOnce(true)
      expect(validator.validate('')).toBe(customMsg)
    })
  })

  describe('string validations', () => {
    test('minLength should validate string length', () => {
      const validator = Validator.string().minLength(3)
      expect(validator.validate('ab')).toBe('Minimum length is 3')
      expect(validator.validate('abc')).toBeNull()
    })

    test('maxLength should validate string length', () => {
      const validator = Validator.string().maxLength(3)
      expect(validator.validate('abcd')).toBe('Maximum length is 3')
      expect(validator.validate('abc')).toBeNull()
    })

    test('should throw error when minLength is used on non-string', () => {
      const validator = Validator.number()
      expect(() => validator.minLength(3)).toThrow(
        'minLength is only applicable to strings'
      )
    })

    test('should throw error when maxLength is used on non-string', () => {
      const validator = Validator.number()
      expect(() => validator.maxLength(3)).toThrow(
        'maxLength is only applicable to strings'
      )
    })

    test('email should validate email format', () => {
      const validator = Validator.string().email('Invalid email')
      expect(validator.validate('invalid')).toBe('Invalid email')
      expect(validator.validate('valid@example.com')).toBeNull()
      expect(validator.validate('')).toBeNull()
    })

    test('website should validate website format', () => {
      const validator = Validator.string().website('Invalid website')

      addHttps.mockReturnValueOnce('https://invalid')
      expect(validator.validate('invalid')).toBe('Invalid website')

      addHttps.mockReturnValueOnce('https://example.com')
      expect(validator.validate('example.com')).toBeNull()
    })

    test('numeric should validate if string is numeric', () => {
      const validator = Validator.string().numeric()

      global.isNaN = jest.fn((val) => isNaN(val))
      global.isNaN.mockReturnValueOnce(true)
      expect(validator.validate('abc')).toBe('This field must be numeric')

      global.isNaN.mockReturnValueOnce(false)
      expect(validator.validate('123')).toBeNull()
    })
  })

  describe('number validations', () => {
    test('min should validate minimum value', () => {
      const validator = Validator.number().min(5)
      expect(validator.validate(4)).toBe('Minimum value is 5')
      expect(validator.validate(5)).toBeNull()
    })

    test('max should validate maximum value', () => {
      const validator = Validator.number().max(5)
      expect(validator.validate(6)).toBe('Maximum value is 5')
      expect(validator.validate(5)).toBeNull()
    })

    test('should throw error when min is used on non-number', () => {
      const validator = Validator.string()
      expect(() => validator.min(3)).toThrow(
        'min is only applicable to numbers'
      )
    })

    test('should throw error when max is used on non-number', () => {
      const validator = Validator.string()
      expect(() => validator.max(3)).toThrow(
        'max is only applicable to numbers'
      )
    })
  })

  describe('array validations', () => {
    test('items should validate array items', () => {
      const stringValidator = Validator.string().minLength(3)
      const arrayValidator = Validator.array().items(stringValidator)

      const mockValidate = jest.fn()
      mockValidate
        .mockReturnValueOnce(null)
        .mockReturnValueOnce('Minimum length is 3')
      stringValidator.validate = mockValidate

      const result = arrayValidator.validate(['valid', 'a'])
      expect(result).toEqual([{ index: 1, error: 'Minimum length is 3' }])
    })

    test('should throw error when items is used on non-array', () => {
      const validator = Validator.string()
      expect(() => validator.items(Validator.string())).toThrow(
        'items() is only applicable to arrays'
      )
    })
  })

  describe('refine', () => {
    test('refine should apply custom validation', () => {
      const customValidator = jest.fn((value) =>
        value === 'invalid' ? 'Is invalid' : null
      )
      const validator = Validator.string().refine(customValidator)

      expect(validator.validate('invalid')).toBe('Is invalid')
      expect(validator.validate('valid')).toBeNull()
      expect(customValidator).toHaveBeenCalledTimes(2)
    })
  })

  describe('object validation', () => {
    test('object should validate object fields', () => {
      const schema = {
        name: Validator.string().required(),
        age: Validator.number().min(18)
      }

      const validator = Validator.object(schema)

      const mockNameValidate = jest.fn()
      const mockAgeValidate = jest.fn()

      schema.name.validate = mockNameValidate
      schema.age.validate = mockAgeValidate

      mockNameValidate.mockReturnValueOnce(null)
      mockAgeValidate.mockReturnValueOnce('Minimum value is 18')

      const result = validator.validate({ name: 'John', age: 16 })
      expect(result).toEqual({ age: 'Minimum value is 18' })

      mockNameValidate.mockReturnValueOnce(null)
      mockAgeValidate.mockReturnValueOnce(null)

      const validResult = validator.validate({ name: 'John', age: 20 })
      expect(validResult).toBeNull()
    })
  })

  describe('type checking', () => {
    test('should return error if value type does not match validator type', () => {
      checkFilledValueType.mockReturnValueOnce(true)
      const validator = Validator.string()
      expect(validator.validate(123)).toBe('Expected string, but got number')
    })
  })
})
