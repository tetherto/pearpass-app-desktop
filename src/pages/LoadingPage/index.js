import { useState, useEffect } from 'react'

import { html } from 'htm/react'

import {
  BottomGlow,
  ContentContainer,
  FooterContainer,
  LoadingText,
  LoadingTextContainer,
  MessageContainer,
  PageContainer,
  PearImage,
  PearImageBlurred,
  PoweredByText,
  ProgressBarBackground,
  ProgressBarFill,
  ProgressContainer,
  WelcomeSubtitle,
  WelcomeTitle
} from './styles'
import { useTranslation } from '../../hooks/useTranslation'
import { PearLogo } from '../../svgs/PearLogo'

/**
 * Loading page component that displays application loading progress
 * @param {Object} props
 * @param {() => void} [props.onLoadingComplete] - Callback when loading is complete
 * @param {number} [props.duration] - Duration of loading animation in ms
 * @returns {JSX.Element}
 */
export const LoadingPage = ({ onLoadingComplete, duration = 3000 }) => {
  const { t } = useTranslation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)

      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(interval)
        onLoadingComplete?.()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration, onLoadingComplete])

  return html`
    <${PageContainer}>
      <${PearImageBlurred}
        src="assets/images/pear_background_blur.webp"
        alt="Blurred background"
      />
      <${PearImage} src="assets/images/pear_background.webp" alt="Background" />

      <${ContentContainer}>
        <${MessageContainer}>
          <${WelcomeTitle}>${t('Welcome to PearPass')}<//>
          <${WelcomeSubtitle}>
            ${t(
              'Public Wi-Fi is risky - avoid typing passwords on open networks.'
            )}
          <//>
        <//>

        <${ProgressContainer}>
          <${ProgressBarBackground}>
            <${ProgressBarFill} progress=${progress} />
          <//>
          <${LoadingTextContainer}>
            <${LoadingText}>${t('Loading...')}<//>
          <//>
        <//>
      <//>

      <${FooterContainer}>
        <${PearLogo} width="35" height="47" />
        <${PoweredByText}>${t('Powered by Pear')}<//>
      <//>

      <${BottomGlow} />
    <//>
  `
}
