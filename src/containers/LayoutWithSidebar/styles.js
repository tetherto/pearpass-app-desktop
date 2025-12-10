import styled from 'styled-components'

export const LayoutWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`

export const SideBarWrapper = styled.div`
  flex-shrink: 0;
`

export const ContentWrapper = styled.div`
  position: relative;
  flex: 1;
  padding: 29px 15px 0;
  display: flex;
  align-items: center;
  align-self: stretch;
  background: ${({ theme }) => theme.colors.grey400.mode1};
`

export const SideViewWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.grey500.mode1};
  border-left: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
  padding: 24px 27px 0 27px;
`
