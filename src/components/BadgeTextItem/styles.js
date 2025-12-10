import styled from 'styled-components'

export const BadgeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.grey500?.mode1};
  padding: 13.5px 10px;
  width: 105px;
  border-radius: 10px;
  gap: 5px;
  font-family: Inter;
  font-style: normal;
  font-size: 12px;
`

export const BadgeText = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.grey100.mode1};
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const BadgeCount = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.colors.grey100.mode1};
`
