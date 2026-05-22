import React from 'react'

import {
  AvatarAlt,
  AvatarContainer,
  AvatarImage,
  AvatarSize,
  FavoriteIcon,
  SelectedAvatarContainer
} from './styles'
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
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
  const { theme } = useTheme()

  const { faviconSrc, isLoading } = useFavicon({ url: websiteDomain })

  if (isSelected) {
    return (
      <SelectedAvatarContainer data-testid={`${testId}-selected`}>
        <Check width="21" height="21" fill={theme.colors.colorTextPrimary} />
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
          <StarFilled width="18" height="18" fill={theme.colors.colorPrimary} />
        </FavoriteIcon>
      )}
    </AvatarContainer>
  )
}
