import styled from 'styled-components'

export const NestedFoldersContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const NestedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  flex: 1;
`

export const NestedFolder = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isActive'].includes(prop)
})`
  display: flex;
  flex: 1;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary400.mode1 : undefined};
  align-items: center;
  gap: 10px;
`

export const AddIconWrapper = styled.div`
  cursor: pointer;
`

export const FolderName = styled.span`
  flex: 1;
  cursor: pointer;
`
