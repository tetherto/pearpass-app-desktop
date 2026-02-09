import styled from 'styled-components'

export type AvatarSize = 'md' | 'sm'

const AVATAR_CONTAINER_SIZE = '30px'

interface AvatarContainerProps {
  size?: AvatarSize
}

interface AvatarAltProps {
  color: string
  size?: AvatarSize
}

const getAvatarHeight = (size?: AvatarSize): string => {
  return size === 'sm' ? '21px' : AVATAR_CONTAINER_SIZE
}

const getAvatarBorderRadius = (size?: AvatarSize): string => {
  return size === 'sm' ? '7px' : '10px'
}

const getAvatarFontSize = (size?: AvatarSize): string => {
  return size === 'sm' ? '12px' : '16px'
}

export const AvatarContainer = styled.div<AvatarContainerProps>`
  position: relative;
  display: flex;
  height: ${({ size }) => getAvatarHeight(size)};
  aspect-ratio: 1/1;
  padding: 2px;
  justify-content: center;
  align-items: center;
  border-radius: ${({ size }) => getAvatarBorderRadius(size)};
  background: ${({ theme }) => theme.colors.secondary400.mode1};
  min-width: 0;
  flex-shrink: 0;
`

export const AvatarAlt = styled.div<AvatarAltProps>`
  color: ${({ color }) => color};
  text-align: center;
  font-family: 'Inter';
  font-size: ${({ size }) => getAvatarFontSize(size)};
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`

export const SelectedAvatarContainer = styled.div`
  display: flex;
  width: ${AVATAR_CONTAINER_SIZE};
  height: ${AVATAR_CONTAINER_SIZE};
  padding: 5px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary400.mode1};
`

export const FavoriteIcon = styled.div`
  position: absolute;
  right: -6px;
  bottom: -9px;

  & > svg {
    fill: ${({ theme }) => theme.colors.primary400.mode1};
  }
`

export const AvatarImage = styled.img`
  min-width: 0;
  display: flex;
  object-fit: cover;
`
