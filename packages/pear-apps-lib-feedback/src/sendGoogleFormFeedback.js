import { getAppNameByType } from './utils/getAppNameByType'
import { getTitleByTopic } from './utils/getTitleByTopic'

/**
 * Sends feedback data to a Google Form.
 *
 * @param {Object} config
 * @param {string} config.formKey
 * @param {Array} [config.additionalFields]
 * @param {Array<{ key: string, value: string }>} [config.additionalFields]
 * @param {Object} [config.mapping]
 * @param {string} [config.mapping.timestamp]
 * @param {string} [config.mapping.topic]
 * @param {string} [config.mapping.app]
 * @param {string} [config.mapping.operatingSystem]
 * @param {string} [config.mapping.deviceModel]
 * @param {string} [config.mapping.message]
 * @param {string} [config.mapping.appVersion]
 * @param {'BUG_REPORT' | 'FEATURE_REQUEST' | 'SECURITY_ISSUE'} [config.topic]
 * @param {'MOBILE' | 'DESKTOP' | 'BROWSER_EXTENSION'} [config.app]
 * @param {string} [config.operatingSystem]
 * @param {string} [config.deviceModel]
 * @param {string} [config.message]
 * @param {string} [config.appVersion]
 */
export const sendGoogleFormFeedback = async ({
  formKey,
  additionalFields,
  mapping = {
    timestamp: undefined,
    topic: undefined,
    app: undefined,
    operatingSystem: undefined,
    deviceModel: undefined,
    message: undefined,
    appVersion: undefined
  },
  topic = '',
  app = '',
  operatingSystem = '',
  deviceModel = '',
  message = '',
  appVersion = ''
}) => {
  if (!formKey) {
    console.error('Google Form key is required.')

    return false
  }

  if (!message) {
    console.error('Message is required.')

    return false
  }

  const formData = new URLSearchParams({
    usp: 'pp_url'
  })

  if (mapping.timestamp) {
    formData.append(mapping.timestamp, new Date().toISOString())
  }

  if (mapping.topic) {
    formData.append(mapping.topic, getTitleByTopic(topic))
  }

  if (mapping.app) {
    formData.append(mapping.app, getAppNameByType(app))
  }

  if (mapping.operatingSystem && operatingSystem) {
    formData.append(mapping.operatingSystem, operatingSystem)
  }

  if (mapping.deviceModel && deviceModel) {
    formData.append(mapping.deviceModel, deviceModel)
  }

  if (mapping.message && message) {
    formData.append(mapping.message, message)
  }

  if (mapping.appVersion && appVersion) {
    formData.append(mapping.appVersion, appVersion)
  }

  if (additionalFields?.length) {
    additionalFields.forEach(({ key, value }) => {
      formData.append(key, value)
    })
  }

  try {
    const response = await fetch(
      `https://docs.google.com/forms/d/e/${formKey}/formResponse?&submit=Submit?${formData.toString()}`
    )

    if (!response.ok) {
      throw new Error(
        'Failed to send feedback to Google Form: ' + JSON.stringify(response)
      )
    }

    return true
  } catch (error) {
    console.error('Error sending feedback to Google Form:', error)
    return false
  }
}
