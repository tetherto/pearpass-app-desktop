import { sendGoogleFormFeedback } from './sendGoogleFormFeedback'
import { getAppNameByType } from './utils/getAppNameByType'
import { getTitleByTopic } from './utils/getTitleByTopic'

jest.mock('./utils/getAppNameByType')
jest.mock('./utils/getTitleByTopic')

global.fetch = jest.fn()

describe('sendGoogleFormFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getAppNameByType.mockReturnValue('Mobile App')
    getTitleByTopic.mockReturnValue('Bug Report')
    global.fetch.mockResolvedValue({ ok: true })
    console.error = jest.fn()
  })

  it('should return false if formKey is not provided', async () => {
    const result = await sendGoogleFormFeedback({
      message: 'Test message'
    })
    expect(result).toBe(false)
    expect(console.error).toHaveBeenCalledWith('Google Form key is required.')
  })

  it('should return false if message is not provided', async () => {
    const result = await sendGoogleFormFeedback({
      formKey: '1234567890'
    })
    expect(result).toBe(false)
    expect(console.error).toHaveBeenCalledWith('Message is required.')
  })

  it('should send feedback successfully', async () => {
    const result = await sendGoogleFormFeedback({
      formKey: '1234567890',
      message: 'Test message'
    })
    expect(result).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://docs.google.com/forms/d/e/1234567890/formResponse'
      )
    )
  })

  it('should include all provided fields in the request', async () => {
    await sendGoogleFormFeedback({
      formKey: '1234567890',
      mapping: {
        timestamp: 'entry.1',
        topic: 'entry.2',
        app: 'entry.3',
        operatingSystem: 'entry.4',
        deviceModel: 'entry.5',
        message: 'entry.6',
        appVersion: 'entry.7'
      },
      topic: 'BUG_REPORT',
      app: 'MOBILE',
      operatingSystem: 'iOS',
      deviceModel: 'iPhone 13',
      message: 'Test message',
      appVersion: '1.0.0'
    })

    expect(getTitleByTopic).toHaveBeenCalledWith('BUG_REPORT')
    expect(getAppNameByType).toHaveBeenCalledWith('MOBILE')

    const fetchCall = fetch.mock.calls[0][0]
    expect(fetchCall).toContain('entry.1')
    expect(fetchCall).toContain('entry.2=Bug+Report')
    expect(fetchCall).toContain('entry.3=Mobile+App')
    expect(fetchCall).toContain('entry.4=iOS')
    expect(fetchCall).toContain('entry.5=iPhone+13')
    expect(fetchCall).toContain('entry.6=Test+message')
    expect(fetchCall).toContain('entry.7=1.0.0')
  })

  it('should handle additional fields', async () => {
    await sendGoogleFormFeedback({
      formKey: '1234567890',
      message: 'Test message',
      additionalFields: [
        { key: 'entry.8', value: 'Additional value 1' },
        { key: 'entry.9', value: 'Additional value 2' }
      ]
    })

    const fetchCall = fetch.mock.calls[0][0]
    expect(fetchCall).toContain('entry.8=Additional+value+1')
    expect(fetchCall).toContain('entry.9=Additional+value+2')
  })

  it('should return false if fetch fails', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))
    const result = await sendGoogleFormFeedback({
      formKey: '1234567890',
      message: 'Test message'
    })
    expect(result).toBe(false)
    expect(console.error).toHaveBeenCalledWith(
      'Error sending feedback to Google Form:',
      expect.any(Error)
    )
  })

  it('should return false if response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false })
    const result = await sendGoogleFormFeedback({
      formKey: '1234567890',
      message: 'Test message'
    })
    expect(result).toBe(false)
  })
})
