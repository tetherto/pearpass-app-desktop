import { createContext, useContext, useEffect, useState } from 'react'

import { html } from 'htm/react'

import { BannerBox } from '../components/BannerBox'
import { CHROME_EXTENSION_STORE_LINK } from '../constants/pearpassLinks'
import { useTranslation } from '../hooks/useTranslation'
import { isNativeMessagingIPCRunning } from '../services/nativeMessagingIPCServer'
import { getNativeMessagingEnabled } from '../services/nativeMessagingPreferences'

const BannerContext = createContext()

export const BannerProvider = ({ children }) => {
  const { t } = useTranslation()

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const enabled = getNativeMessagingEnabled()
    const isRunning = isNativeMessagingIPCRunning()

    if (!enabled || !isRunning) {
      setVisible(true)
    }
  }, [])

  const showBanner = () => {
    setVisible(true)
  }

  const hideBanner = () => {
    setVisible(false)
  }

  return html`
    <${BannerContext.Provider}
      value=${{
        visible,
        showBanner,
        hideBanner
      }}
    >
      ${children}
      ${visible &&
      html`
        <${BannerBox}
          onClose=${hideBanner}
          isVisible=${visible}
          href=${CHROME_EXTENSION_STORE_LINK}
          title=${t('You’ve got the app. Now unlock the full experience.')}
          message=${t(
            'Install our browser extension to autofill passwords, save new logins in a click, and log in instantly,right where you browse.'
          )}
          highlightedDescription=${t(
            'No more copy-paste. No more interruptions. Just seamless security.'
          )}
          buttonText=${t('Download now')}
        />
      `}
    <//>
  `
}

export const useBanner = () => useContext(BannerContext)
