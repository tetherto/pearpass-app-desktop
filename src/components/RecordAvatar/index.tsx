import React from 'react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import {
  AvatarAlt,
  AvatarContainer,
  AvatarImage,
  AvatarSize,
  FavoriteIcon,
  SelectedAvatarContainer
} from './styles'
import { CheckIcon, StarIcon } from '../../lib-react-components'
import { useFavicon } from 'pearpass-lib-vault'

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
        <CheckIcon size="21" color={colors.black.mode1} />
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
          <StarIcon size="18" fill={true} color={colors.primary400.mode1} />
        </FavoriteIcon>
      )}
    </AvatarContainer>
  )
}
