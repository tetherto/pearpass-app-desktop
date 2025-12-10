import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 30px 22px 0;
  align-self: stretch;
  background: ${({ theme }) => theme.colors.grey400.mode1};
`

export const NavBar = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  flex: 0 0 auto;
`

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 750px;
  flex: 1 1 0;
`

export const Tabs = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  flex: 0 0 auto;
`

export const TabTitle = styled.span`
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary400.mode1 : theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: ${({ isActive }) => (isActive ? 700 : 500)};
  cursor: pointer;
`

export const TabContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px 0;
  gap: 24px;
  flex: 1 1 0;
  overflow: auto;
`

export const TabFooter = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  justify-content: end;
  padding-bottom: 10px;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
`

export const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary200.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  text-decoration: none;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.primary300.mode1};
  }
`
