import styled from 'styled-components'

import { isV2 } from '../../utils/designVersion'

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
  overflow: hidden;
  ${isV2() &&
  `
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    padding-bottom: 20px;
  `}
`

export const SidebarNestedFoldersContainer = styled.div`
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  ${isV2() ? 'flex-shrink: 0;' : 'flex: 1; min-height: 0;'}
`

export const FoldersWrapper = styled.div`
  overflow-y: ${isV2() ? 'visible' : 'auto'};
  display: flex;
  flex-direction: column;
  ${isV2() ? 'flex-shrink: 0;' : 'min-height: 0;'}
`

export const SidebarAuthenticatorSection = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
  flex-shrink: 0;
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
