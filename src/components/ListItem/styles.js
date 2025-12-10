import styled from 'styled-components'

export const ListItemContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 5px 10px;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  background-color: ${({ isSelected }) =>
    isSelected ? 'rgba(134, 170, 172, 0.2)' : 'transparent'};
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`
export const ListItemInfo = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`

export const ListItemDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 4px;
`
export const ListItemName = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
`
export const ListItemDate = styled.p`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 10px;
  font-style: normal;
  font-weight: 300;
`

export const ListItemActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

export const SelectedListItemIconContainer = styled.div`
  display: flex;
  width: 30px;
  height: 30px;
  padding: 5px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary400.mode1};
`
