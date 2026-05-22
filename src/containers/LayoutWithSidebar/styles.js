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
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-self: stretch;
`

export const SideViewWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #232323;
  border-left: 1px solid #666666;
  padding: 24px 27px 0 27px;
`
