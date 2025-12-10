import { getTitleByTopic } from './getTitleByTopic'

describe('getTitleByTopic', () => {
  test('returns "Bug Report" when passed "BUG_REPORT"', () => {
    expect(getTitleByTopic('BUG_REPORT')).toBe('Bug report')
  })

  test('returns "Feature Request" when passed "FEATURE_REQUEST"', () => {
    expect(getTitleByTopic('FEATURE_REQUEST')).toBe('Feature request')
  })

  test('returns "Security Issue" when passed "SECURITY_ISSUE"', () => {
    expect(getTitleByTopic('SECURITY_ISSUE')).toBe('Security issue')
  })

  test('returns "Feedback from User" when passed an undefined topic', () => {
    expect(getTitleByTopic(undefined)).toBe('Feedback from User')
  })

  test('returns "Feedback from User" when passed an invalid topic', () => {
    expect(getTitleByTopic('INVALID_TOPIC')).toBe('Feedback from User')
  })
})
