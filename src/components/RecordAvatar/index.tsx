import React from 'react'
import { colors } from '@tetherto/pearpass-lib-ui-theme-provider'

import {
  AvatarAlt,
  AvatarContainer,
  AvatarImage,
  AvatarSize,
  FavoriteIcon,
  SelectedAvatarContainer
} from './styles'
import { Check, StarFilled } from '@tetherto/pearpass-lib-ui-kit/icons'
import { useFavicon } from '@tetherto/pearpass-lib-vault'

interface Props {
  websiteDomain: string
  initials: string
  size: AvatarSize
  isSelected: boolean
  isFavorite: boolean
  color: string
  testId?: string
}

export const RecordAvatar = (props: Props): React.ReactElement => {
  const { websiteDomain, initials, size, isSelected, isFavorite, color, testId } = props

  const { faviconSrc, isLoading } = useFavicon({ url: websiteDomain })

  if (isSelected) {
    return (
      <SelectedAvatarContainer data-testid={`${testId}-selected`}>
        <Check width="21" height="21" fill={colors.black.mode1} />
      </SelectedAvatarContainer>
    )
  }

  const isFaviconLoaded = faviconSrc && !isLoading

  return (
    <AvatarContainer size={size} data-testid={testId}>
      {isFaviconLoaded && <AvatarImage src={faviconSrc} />}

      {!isFaviconLoaded && (
        <AvatarAlt color={color} size={size}>
          {initials}
        </AvatarAlt>
      )}

      {isFavorite && (
        <FavoriteIcon data-testid={`avatar-favorite-${initials}`}>
          <StarFilled width="18" height="18" fill={colors.primary400.mode1} />
        </FavoriteIcon>
      )}
    </AvatarContainer>
  )
}
