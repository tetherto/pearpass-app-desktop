import styled from 'styled-components'

export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
`

export const HeaderChildrenWrapper = styled.div`
  flex: 1;
`

export const CloseIconWrapper = styled.div`
  margin-left: auto;
  display: flex;
  padding: 4px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.black.dark};
  flex-shrink: 0;
`
