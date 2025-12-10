import styled from 'styled-components'

export const MenuList = styled.div`
  display: flex;
  font-family: 'Inter';
  position: absolute;
  flex-direction: column;
  width: 200px;
  align-items: flex-start;
  overflow: hidden;
`

export const MenuItem = styled.div`
  display: flex;
  width: 100%;
  padding: 5px 9px;
  gap: 12px;
  align-self: stretch;
  color: ${({ theme }) => theme.colors.white.mode1};
  background: ${({ theme }) => theme.colors.grey400.mode1};
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  border-bottom: none;
  align-items: center;
  cursor: pointer;
  position: relative;

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  }

  &:hover {
    border-color: ${({ color }) => color};
  }

  &:hover + div {
    border-top-color: ${({ color }) => color};
  }
`
