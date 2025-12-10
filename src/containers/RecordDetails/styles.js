import styled from 'styled-components'

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
`

export const RecordInfo = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`

export const Title = styled.div`
  color: ${({ theme }) => theme.colors.white.dark};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 700;
`

export const FolderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${({ theme }) => theme.colors.grey200.dark};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
  margin-top: 2px;
`

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const FavoriteButtonWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['favorite'].includes(prop)
})`
  display: flex;
  cursor: pointer;

  & path {
    fill: ${({ favorite, theme }) => favorite && theme.colors.primary400.mode1};
  }
`

export const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
  padding-bottom: 24px;
`

export const RecordActions = styled.div`
  display: flex;
`
