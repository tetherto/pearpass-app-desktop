import React from 'react'

import { Button, Dialog, Text, Title } from '@tetherto/pearpass-lib-ui-kit'
import { OpenInNew } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { createStyles } from './styles'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { CHROME_EXTENSION_STORE_LINK } from '../../../constants/pearpassLinks'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'

export const BrowserExtensionDialogV2 = () => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  const handleDismiss = () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXTENSION_DIALOG_DISMISSED, 'true')
    closeModal()
  }

  const handleDownload = () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXTENSION_DIALOG_DISMISSED, 'true')
    window.electronAPI?.openExternal(CHROME_EXTENSION_STORE_LINK)
    closeModal()
  }

  return (
    <Dialog
      title={t('Improve your sign-in experience')}
      onClose={handleDismiss}
      footer={
        <>
          <Button variant="secondary" size="small" onClick={handleDismiss}>
            {t("I'll do it later")}
          </Button>
          <Button variant="primary" size="small" onClick={handleDownload} iconBefore={<OpenInNew width={16} height={16} />}>
            {t('Download Extension')}
          </Button>
        </>
      }
    >
      <div style={styles.body}>
        <img
          src="assets/images/browser_mockup.svg"
          alt=""
          style={styles.browserMockup}
        />

        <div style={styles.textContent}>
          {/* @ts-ignore */}
          <Title as="h2" style={styles.heading}>
            {t("You've got the app.")}{'\n'}
            {t('Now unlock the full experience.')}
          </Title>
          {/* @ts-ignore */}
          <Text as="p" variant="label" style={styles.description}>
            {t('Install the browser extension to autofill passwords, save new logins with one click, and sign in instantly —')}{'\n'}
            {t('right where you browse.')}{'\n\n'}
            {t('No copy-paste. No interruptions. Just seamless security.')}
          </Text>
        </div>

      </div>
    </Dialog>
  )
}
