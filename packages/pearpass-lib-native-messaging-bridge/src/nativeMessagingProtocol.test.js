import {
  wrapMessage,
  unwrapMessage,
  isWrappedMessage
} from './nativeMessagingProtocol'

describe('nativeMessagingProtocol', () => {
  describe('wrapMessage', () => {
    it('should wrap a message with correct length and message', () => {
      const msg = { foo: 'bar', num: 42 }
      const wrapped = wrapMessage(msg)
      expect(wrapped).toHaveProperty('length')
      expect(wrapped).toHaveProperty('message', msg)
      const expectedLength = Buffer.from(JSON.stringify(msg)).length
      expect(wrapped.length).toBe(expectedLength)
    })
  })

  describe('unwrapMessage', () => {
    it('should unwrap a valid wrapped message', () => {
      const msg = { hello: 'world' }
      const wrapped = wrapMessage(msg)
      const unwrapped = unwrapMessage(wrapped)
      expect(unwrapped).toEqual(msg)
    })

    it('should return null for invalid wrapped message (missing fields)', () => {
      expect(unwrapMessage(null)).toBeNull()
      expect(unwrapMessage({})).toBeNull()
      expect(unwrapMessage({ length: 10 })).toBeNull()
      expect(unwrapMessage({ message: {} })).toBeNull()
    })

    it('should return null if length does not match actual message length', () => {
      const msg = { test: 'fail' }
      const wrapped = wrapMessage(msg)
      wrapped.length = wrapped.length + 1 // tamper length
      expect(unwrapMessage(wrapped)).toBeNull()
    })
  })

  describe('isWrappedMessage', () => {
    it('should return true for valid wrapped message', () => {
      const msg = { a: 1 }
      const wrapped = wrapMessage(msg)
      expect(isWrappedMessage(wrapped)).toBe(true)
    })

    it('should return false for non-object or missing fields', () => {
      expect(isWrappedMessage(null)).toBe(false)
      expect(isWrappedMessage(undefined)).toBe(false)
      expect(isWrappedMessage(123)).toBe(false)
      expect(isWrappedMessage({})).toBe(false)
      expect(isWrappedMessage({ length: 5 })).toBe(false)
      expect(isWrappedMessage({ message: {} })).toBe(false)
    })
  })
})
