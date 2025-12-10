import { sendSlackFeedback } from './sendSlackFeedback'
import { getAppNameByType } from './utils/getAppNameByType'
import { getColorByTopic } from './utils/getColorByTopic'
import { getTitleByTopic } from './utils/getTitleByTopic'

jest.mock('../src/utils/getAppNameByType')
jest.mock('../src/utils/getColorByTopic')
jest.mock('../src/utils/getTitleByTopic')

console.error = jest.fn()

describe('sendSlackFeedback', () => {
  global.fetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    getAppNameByType.mockReturnValue('Mock App')
    getColorByTopic.mockReturnValue('#MOCK_COLOR')
    getTitleByTopic.mockReturnValue('Mock Title')
    global.fetch.mockResolvedValue({ ok: true })
  })

  test('should send slack message with correct data', async () => {
    const mockConfig = {
      webhookUrPath: '/T123/B123/xyz',
      topic: 'BUG_REPORT',
      app: 'MOBILE',
      operatingSystem: 'iOS 15',
      deviceModel: 'iPhone 13',
      message: 'Test message',
      appVersion: '1.0.0',
      customFields: [{ title: 'Custom', value: 'Field', short: true }],
      additionalAttachment: { author_name: 'Tester' }
    }

    const expectedUrl = 'https://hooks.slack.com/services/T123/B123/xyz'

    await sendSlackFeedback(mockConfig)

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String)
    })

    const requestBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(requestBody.text).toBe('*Mock Title*')
    expect(requestBody.attachments[0].color).toBe('#MOCK_COLOR')
    expect(requestBody.attachments[0].footer).toBe('Mock App')
    expect(requestBody.attachments[0].fields).toContainEqual({
      title: 'Description',
      value: 'Test message',
      short: false
    })
    expect(requestBody.attachments[0].author_name).toBe('Tester')
  })

  test('should not call fetch if webhookUrPath is not provided', async () => {
    const mockConfig = {
      topic: 'BUG_REPORT',
      operatingSystem: 'iOS 15',
      deviceModel: 'iPhone 13',
      message: 'Test message'
    }

    await sendSlackFeedback(mockConfig)

    expect(fetch).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(
      'Slack webhook URL path is required.'
    )
  })

  test('should not call fetch if message is not provided', async () => {
    const mockConfig = {
      webhookUrPath: '/T123/B123/xyz',
      topic: 'BUG_REPORT',
      operatingSystem: 'iOS 15',
      deviceModel: 'iPhone 13'
    }

    await sendSlackFeedback(mockConfig)

    expect(fetch).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('Message is required.')
  })

  test('should handle fetch error properly', async () => {
    const mockConfig = {
      webhookUrPath: '/T123/B123/xyz',
      topic: 'BUG_REPORT',
      operatingSystem: 'iOS 15',
      deviceModel: 'iPhone 13',
      message: 'Test message'
    }
    global.fetch.mockRejectedValue(new Error('Network error'))

    await sendSlackFeedback(mockConfig)

    expect(console.error).toHaveBeenCalledWith(
      'Error sending Slack feedback:',
      expect.any(Error)
    )
  })

  test('should throw error when response is not ok', async () => {
    const mockConfig = {
      webhookUrPath: '/T123/B123/xyz',
      topic: 'BUG_REPORT',
      operatingSystem: 'iOS 15',
      deviceModel: 'iPhone 13',
      message: 'Test message'
    }
    global.fetch.mockResolvedValue({ ok: false })

    await sendSlackFeedback(mockConfig)

    expect(console.error).toHaveBeenCalledWith(
      'Error sending Slack feedback:',
      expect.any(Error)
    )
  })
})
