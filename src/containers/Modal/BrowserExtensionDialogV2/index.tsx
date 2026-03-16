import React from 'react'

import { Button } from '@tetherto/pearpass-lib-ui-kit'
import { Close } from '@tetherto/pearpass-lib-ui-kit/icons'

import { styles } from './styles'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

export const BrowserExtensionDialogV2 = () => {
  const { t } = useTranslation()
  const { closeModal } = useModal()

  const handleDismiss = () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXTENSION_DIALOG_DISMISSED, 'true')
    closeModal()
  }

  const handleDownload = () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXTENSION_DIALOG_DISMISSED, 'true')
    window.open('https://chromewebstore.google.com/', '_blank')
    closeModal()
  }

  return (
    <div style={styles.dialog}>
      <div style={styles.header}>
        <p style={styles.headerTitle}>
          {t('Improve your sign-in experience')}
        </p>
        <button
          style={styles.closeButton}
          onClick={handleDismiss}
          aria-label="Close"
        >
          <Close width={16} height={16} />
        </button>
      </div>

      <div style={styles.body}>
        {/* Browser mockup */}
        <div style={styles.browserMockup}>
          <div style={styles.tabBar}>
            <div style={styles.tabActive}>
              <div style={styles.tabFavicon} />
              <div style={styles.tabTitle} />
            </div>
          </div>
          <div style={styles.urlBar}>
            <div style={styles.urlNavIcons}>
              <span style={styles.navIcon}>&larr;</span>
              <span style={styles.navIcon}>&rarr;</span>
              <span style={styles.navIcon}>&#x21bb;</span>
              <span style={styles.navIcon}>&#x2302;</span>
            </div>
            <div style={styles.urlInputWrapper}>
              <div style={styles.urlText} />
            </div>
            <div style={styles.urlRightIcons}>
              <div style={styles.vaultSymbol}>
                <svg width="10" height="13" viewBox="0 0 10 13" fill="none">
                  <path d="M5 0L0 2.5V6C0 9.3 2.1 12.4 5 13C7.9 12.4 10 9.3 10 6V2.5L5 0Z" fill="#b0d944" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div style={styles.textContent}>
          <p style={styles.heading}>
            {t("You've got the app.")}{'\n'}
            {t('Now unlock the full experience.')}
          </p>
          <p style={styles.description}>
            {t('Install the browser extension to autofill passwords, save new logins with one click, and sign in instantly —')}{'\n'}
            {t('right where you browse.')}{'\n\n'}
            {t('No copy-paste. No interruptions. Just seamless security.')}
          </p>
        </div>

        <div style={styles.fadeGradient} />
      </div>

      <div style={styles.footer}>
        <Button variant="secondary" size="small" onClick={handleDismiss}>
          {t("I'll do it later")}
        </Button>
        <Button variant="primary" size="small" onClick={handleDownload}>
          {t('Download Extension')}
        </Button>
      </div>
    </div>
  )
}
