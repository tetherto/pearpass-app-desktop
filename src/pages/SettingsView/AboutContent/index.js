import { useEffect, useState } from 'react'

import { html } from 'htm/react'
import {
  sendGoogleFormFeedback,
  sendSlackFeedback
} from 'pear-apps-lib-feedback'
import { PRIVACY_POLICY, TERMS_OF_USE } from 'pearpass-lib-constants'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { CardSingleSetting } from '../../../components/CardSingleSetting'
import {
  GOOGLE_FORM_KEY,
  GOOGLE_FORM_MAPPING,
  SLACK_WEBHOOK_URL_PATH
} from '../../../constants/feedback'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useToast } from '../../../context/ToastContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { OutsideLinkIcon } from '../../../lib-react-components/icons/OutsideLinkIcon'
import { isOnline } from '../../../utils/isOnline'
import { logger } from '../../../utils/logger'
import { SettingsReportSection } from '../SettingsTab/SettingsReportSection'

const OFFLINE_TIMEOUT = 'OFFLINE_TIMEOUT'
const OFFLINE_TIMEOUT_MS = 10000
const OFFLINE_TIMEOUT_MESSAGE =
  'You are offline, please check your internet connection'

export const AboutContent = () => {
  const { t } = useTranslation()
  const { setToast } = useToast()

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentVersion, setCurrentVersion] = useState('')
  useGlobalLoading({ isLoading })

  const handleReportProblem = async () => {
    if (!message?.length || isLoading) {
      return
    }

    try {
      setIsLoading(true)

      if (!isOnline()) {
        setToast({
          message: t(OFFLINE_TIMEOUT_MESSAGE)
        })
        return
      }

      const payload = {
        message,
        topic: 'BUG_REPORT',
        app: 'DESKTOP',
        operatingSystem: navigator?.userAgentData?.platform,
        deviceModel: navigator?.platform,
        appVersion: currentVersion
      }

      const sendFeedbackWithTimeout = async () => {
        await sendSlackFeedback({
          webhookUrPath: SLACK_WEBHOOK_URL_PATH,
          ...payload
        })

        await sendGoogleFormFeedback({
          formKey: GOOGLE_FORM_KEY,
          mapping: GOOGLE_FORM_MAPPING,
          ...payload
        })
      }

      await Promise.race([
        sendFeedbackWithTimeout(),
        new Promise((_, reject) => {
          setTimeout(() => {
            if (!isOnline()) {
              reject(new Error(OFFLINE_TIMEOUT))
            }
          }, OFFLINE_TIMEOUT_MS)
        })
      ])

      setMessage('')

      setIsLoading(false)

      setToast({
        message: t('Feedback sent')
      })
    } catch (error) {
      setIsLoading(false)

      if (error?.message === OFFLINE_TIMEOUT) {
        setToast({
          message: t(OFFLINE_TIMEOUT_MESSAGE)
        })
      } else {
        setToast({
          message: t('Something went wrong, please try again')
        })
      }

      logger.error('handleReportProblem', 'Error sending feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetch('/package.json')
      .then((r) => r.json())
      .then((pkg) => setCurrentVersion(pkg.version))
      .catch((error) =>
        logger.error(
          'useGetMultipleFiles',
          'Error fetching package.json:',
          error
        )
      )
  }, [])

  return html`
    <${SettingsReportSection}
      onSubmitReport=${handleReportProblem}
      message=${message}
      title=${t('Report a problem')}
      buttonText=${t('send')}
      textAreaPlaceholder=${t('Write your issue...')}
      textAreaOnChange=${setMessage}
    />

    <${CardSingleSetting}
      title=${t('PearPass version')}
      description=${t('Here you can find all the info about your app.')}
    >
      <div
        style=${{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          fontFamily: 'Inter',
          fontSize: '14px'
        }}
      >
        <div
          style=${{
            display: 'flex',
            justifyContent: 'space-between',
            color: colors.white.mode1
          }}
        >
          <span>${t('App version')}</span>
          <span style=${{ color: colors.primary400.mode1 }}>
            ${currentVersion}
          </span>
        </div>
        <a
          href=${TERMS_OF_USE}
          target="_blank"
          rel="noopener noreferrer"
          style=${{
            color: colors.primary400.mode1,
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          ${t('Terms of use')}
        </a>
        <a
          href=${PRIVACY_POLICY}
          target="_blank"
          rel="noopener noreferrer"
          style=${{
            color: colors.primary400.mode1,
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          ${t('Privacy statement')}
        </a>
        <a
          href="https://pass.pears.com"
          target="_blank"
          rel="noopener noreferrer"
          style=${{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: colors.white.mode1,
            textDecoration: 'none'
          }}
        >
          <span>${t('Visit our website')}</span>
          <span
            style=${{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: colors.primary400.mode1
            }}
          >
            <${OutsideLinkIcon} color=${colors.primary400.mode1} />
            pass.pears.com
          </span>
        </a>
      </div>
    <//>
  `
}
