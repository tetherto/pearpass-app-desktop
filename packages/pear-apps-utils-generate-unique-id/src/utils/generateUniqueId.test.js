import { generateUniqueId } from './generateUniqueId'

describe('generateUniqueId', () => {
  it('should return a string', () => {
    const id = generateUniqueId()
    expect(typeof id).toBe('string')
  })

  it('should generate unique IDs', () => {
    const id1 = generateUniqueId()
    const id2 = generateUniqueId()
    expect(id1).not.toBe(id2)
  })

  it('should generate IDs with consistent format', () => {
    const id = generateUniqueId()
    expect(id.length).toBeGreaterThan(10)
  })

  it('should use Date.now() for timestamp portion', () => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now)

    const id = generateUniqueId()
    const timestampPart = now.toString(36)

    expect(id.startsWith(timestampPart)).toBe(true)

    jest.restoreAllMocks()
  })
})
