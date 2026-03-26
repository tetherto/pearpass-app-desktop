import React from 'react'
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { BackgroundWithGradient } from '../BackgroundWithGradient'

import {
  ContentWrapper,
  Panel,
  ShellViewport,
  SolidBackground,
  Stage
} from './styles'

interface OnboardingShellProps {
  background: 'gradient' | 'solid'
  children: React.ReactNode
}

export const OnboardingShell = ({
  background,
  children
}: OnboardingShellProps): React.ReactElement => {
  const { theme } = useTheme()

  const content = (
    <Stage>
      <Panel $isSolid={background === 'solid'}>
        <ContentWrapper>{children}</ContentWrapper>
      </Panel>
    </Stage>
  )

  if (background === 'gradient') {
    return (
      <ShellViewport>
        <BackgroundWithGradient>{content}</BackgroundWithGradient>
      </ShellViewport>
    )
  }

  return (
    <ShellViewport>
      <SolidBackground $backgroundColor={theme.colors.colorSurfacePrimary}>
        {content}
      </SolidBackground>
    </ShellViewport>
  )
}
