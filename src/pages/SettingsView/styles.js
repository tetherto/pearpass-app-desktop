import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`

export const SettingsSidebar = styled.div`
  display: flex;
  gap: 20px;
  padding: 25px 20px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  width: 245px;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  border-right: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
  background: ${({ theme }) => theme.colors.grey500.mode1};
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

export const NavItems = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`

export const SettingsNavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 8px;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary400.mode1 : theme.colors.white.mode1};
  background: ${({ theme, isActive }) =>
    isActive ? theme.colors.grey300.mode1 : theme.colors.grey400.mode1};

  &:hover {
    background: ${({ theme }) => theme.colors.grey300.mode1};
  }
`

export const SettingsContentArea = styled.div`
  flex: 1;
  height: 100%;
  padding: 25px 20px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.grey400.mode1};
`

export const SettingsContentInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 750px;
`
