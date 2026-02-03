import { useEffect, useState } from 'react'

import { useLingui } from '@lingui/react'
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
import { OutsideLinkIcon } from '../../../lib-react-components/icons/OutsideLinkIcon'
import { logger } from '../../../utils/logger'
import { SettingsReportSection } from '../SettingsTab/SettingsReportSection'

export const AboutContent = () => {
  const { i18n } = useLingui()
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

      const payload = {
        message,
        topic: 'BUG_REPORT',
        app: 'DESKTOP',
        operatingSystem: navigator?.userAgentData?.platform,
        deviceModel: navigator?.platform,
        appVersion: currentVersion
      }

      await sendSlackFeedback({
        webhookUrPath: SLACK_WEBHOOK_URL_PATH,
        ...payload
      })

      await sendGoogleFormFeedback({
        formKey: GOOGLE_FORM_KEY,
        mapping: GOOGLE_FORM_MAPPING,
        ...payload
      })

      setMessage('')

      setIsLoading(false)

      setToast({
        message: i18n._('Feedback sent')
      })
    } catch (error) {
      setIsLoading(false)

      setToast({
        message: i18n._('Something went wrong, please try again')
      })

      logger.error('useGetMultipleFiles', 'Error sending feedback:', error)
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
      title=${i18n._('Report a problem')}
      description=${i18n._(
        "Tell us what's going wrong and leave your email so we can follow up with you."
      )}
      buttonText=${i18n._('send')}
      textAreaPlaceholder=${i18n._('Write your issue...')}
      textAreaOnChange=${setMessage}
    />

    <${CardSingleSetting}
      title=${i18n._('PearPass version')}
      description=${i18n._('Here you can find all the info about your app.')}
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
          <span>${i18n._('App version')}</span>
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
          ${i18n._('Terms of use')}
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
          ${i18n._('Privacy statement')}
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
          <span>${i18n._('Visit our website')}</span>
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
