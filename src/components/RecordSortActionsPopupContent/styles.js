import styled from 'styled-components'

export const MenuCard = styled.div`
  position: absolute;
  font-family: 'Inter';
  font-size: 10px;
  align-items: flex-start;
  display: flex;
  padding: 5px;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  background: ${({ theme }) => theme.colors.grey400.mode1};
`

export const MenuItem = styled.div`
  display: flex;
  padding: 4px 0px;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  align-self: stretch;
  word-break: keep-all;
  white-space: nowrap;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white.mode1};

  & > div:first-child {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`
