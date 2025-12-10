import { getAppNameByType } from './utils/getAppNameByType'
import { getColorByTopic } from './utils/getColorByTopic'
import { getTitleByTopic } from './utils/getTitleByTopic'

/**
 * Sends feedback to a Slack webhook.
 *
 * @param {Object} config
 * @param {string} config.webhookUrPath
 * @param {'BUG_REPORT' | 'FEATURE_REQUEST' | 'SECURITY_ISSUE'} config.topic
 * @param {'MOBILE' | 'DESKTOP' | 'BROWSER_EXTENSION'} [config.app]
 * @param {string} config.operatingSystem
 * @param {string} config.deviceModel
 * @param {string} config.message
 * @param {string} [config.appVersion]
 * @param {Array} [config.customFields=[]]
 * @param {Object} [config.additionalAttachment={}]
 */
export const sendSlackFeedback = async ({
  webhookUrPath,
  topic,
  app,
  operatingSystem,
  deviceModel,
  message,
  appVersion,
  customFields = [],
  additionalAttachment = {}
}) => {
  if (!webhookUrPath) {
    console.error('Slack webhook URL path is required.')

    return false
  }

  if (!message) {
    console.error('Message is required.')

    return false
  }

  const webhookUrl = `https://hooks.slack.com/services${webhookUrPath}`

  const baseFields = [
    { title: 'Description', value: message, short: false },
    { title: 'Operating System', value: operatingSystem, short: true },
    {
      title: 'Device Model',
      value: deviceModel,
      short: true
    },
    { title: 'App Version', value: appVersion, short: true }
  ]

  const fields = [...baseFields, ...customFields]

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `*${getTitleByTopic(topic)}*`,
        attachments: [
          {
            color: getColorByTopic(topic),
            fields,
            footer: getAppNameByType(app),
            ts: Math.floor(Date.now() / 1000),
            ...additionalAttachment
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send Slack feedback')
    }

    return true
  } catch (error) {
    console.error('Error sending Slack feedback:', error)

    return false
  }
}
