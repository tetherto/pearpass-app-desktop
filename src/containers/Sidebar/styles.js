import styled from 'styled-components'

export const SidebarWrapper = styled.div`
  display: flex;
  gap: 20px;
  padding: 25px 20px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  width: ${({ size }) => (size === 'tight' ? '245px' : '296px')};
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
  border-right: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
  background: ${({ theme }) => theme.colors.grey500.mode1};
  height: 100%;
`

export const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`

export const PearPass = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Humble Nostalgia';
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  height: 26px;
`

export const sideBarContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  gap: 20px;
  min-height: 0;
`

export const SidebarNestedFoldersContainer = styled.div`
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
`

export const FoldersWrapper = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

export const SidebarSettings = styled.div`
  width: 100%;
  flex-grow: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const SettingsContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 5px;
  gap: 5px;
  cursor: pointer;
`

export const SettingsSeparator = styled.div`
  width: 100%;
  height: 2px;
  background: ${({ theme }) => theme.colors.grey300.mode1};
`
