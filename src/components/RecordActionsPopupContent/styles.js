import styled from 'styled-components'

export const MenuCard = styled.div`
  position: absolute;
  font-family: 'Inter';
  font-size: ${({ variant }) => (variant === 'default' ? '14px' : '10px')};
  align-items: flex-start;
  display: flex;
  padding: ${({ variant }) => (variant === 'default' ? '4px 8px' : '5px 5px')};
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  background: ${({ theme }) => theme.colors.grey400.mode1};
  min-width: 150px;
`

export const MenuItem = styled.div`
  display: flex;
  padding: 8px 0px;
  align-items: center;
  gap: 5px;
  align-self: stretch;
  word-break: keep-all;
  white-space: nowrap;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white.mode1};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  }
`
