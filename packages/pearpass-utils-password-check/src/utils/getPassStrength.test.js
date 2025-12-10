import { getPassStrength } from './getPassStrength'

describe('getPassStrength', () => {
  it('returns "vulnerable" when less than 4 rules pass', () => {
    expect(
      getPassStrength({ a: false, b: false, c: true, d: false, e: true })
    ).toBe('vulnerable')
    expect(getPassStrength({ a: true, b: false, c: false })).toBe('vulnerable')
    expect(getPassStrength({})).toBe('vulnerable')
  })

  it('returns "weak" when exactly 4 rules pass', () => {
    expect(
      getPassStrength({ a: true, b: true, c: true, d: true, e: false })
    ).toBe('weak')
    expect(
      getPassStrength({ a: false, b: true, c: true, d: true, e: true })
    ).toBe('weak')
    expect(getPassStrength({ a: true, b: true, c: true, d: true })).toBe('weak')
  })

  it('returns "safe" when more than 4 rules pass', () => {
    expect(
      getPassStrength({ a: true, b: true, c: true, d: true, e: true })
    ).toBe('safe')
    expect(
      getPassStrength({ a: true, b: true, c: true, d: true, e: true, f: true })
    ).toBe('safe')
  })

  it('handles all rules failing', () => {
    expect(getPassStrength({ a: false, b: false, c: false, d: false })).toBe(
      'vulnerable'
    )
  })

  it('handles all rules passing', () => {
    expect(
      getPassStrength({
        a: true,
        b: true,
        c: true,
        d: true,
        e: true,
        f: true,
        g: true
      })
    ).toBe('safe')
  })
})
