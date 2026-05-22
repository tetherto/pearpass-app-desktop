import React, { useEffect, useState } from 'react'
import { Text, Title, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { OnboardingShell } from '../../components/OnboardingShell'
import {
  ArtFrame,
  Footer,
  MainContent,
  ProgressFill,
  ProgressSection,
  ProgressTrack,
  TextBlock,
} from './LoadingPageStyles'
import { OnboardingLock } from '../../svgs/OnboardingLock'

interface LoadingPageProps {
  onLoadingComplete?: () => void
  duration?: number
}

export const LoadingPage = ({
  onLoadingComplete,
  duration = 3000
}: LoadingPageProps): React.ReactElement => {
  const { theme } = useTheme()
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

  return (
    <OnboardingShell background="gradient">
      <MainContent>
        <ArtFrame>
          <OnboardingLock />
        </ArtFrame>

        <TextBlock>
          <Title>Welcome to PearPass</Title>
          <Text as="p" variant="label">
            Your items are stored locally, not on our servers.
            <br />
            Only you have access to them.
          </Text>
        </TextBlock>

        <Footer>
          <ProgressSection>
            <ProgressTrack $trackColor={theme.colors.colorSurfaceHover}>
              <ProgressFill
                $fillColor={theme.colors.colorPrimary}
                $progress={progress}
              />
            </ProgressTrack>
          </ProgressSection>
        </Footer>
      </MainContent>
    </OnboardingShell>
  )
}
