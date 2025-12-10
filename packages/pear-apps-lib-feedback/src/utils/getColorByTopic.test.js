import { getColorByTopic } from './getColorByTopic'

describe('getColorByTopic', () => {
  test('returns "#FF5733" when passed "BUG_REPORT"', () => {
    expect(getColorByTopic('BUG_REPORT')).toBe('#FF5733')
  })

  test('returns "#33FF57" when passed "FEATURE_REQUEST"', () => {
    expect(getColorByTopic('FEATURE_REQUEST')).toBe('#33FF57')
  })

  test('returns "#3357FF" when passed "SECURITY_ISSUE"', () => {
    expect(getColorByTopic('SECURITY_ISSUE')).toBe('#3357FF')
  })

  test('returns "#FFFFFF" when passed an undefined topic', () => {
    expect(getColorByTopic(undefined)).toBe('#FFFFFF')
  })

  test('returns "#FFFFFF" when passed an invalid topic', () => {
    expect(getColorByTopic('INVALID_TOPIC')).toBe('#FFFFFF')
  })
})
