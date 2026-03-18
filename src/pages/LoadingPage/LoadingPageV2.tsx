import React from 'react'
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
} from './LoadingPageV2Styles'
import { OnboardingLock } from '../../svgs/OnboardingLock'

interface LoadingPageV2Props {
  progress: number
}

export const LoadingPageV2 = ({
  progress
}: LoadingPageV2Props): React.ReactElement => {
  const { theme } = useTheme()

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
