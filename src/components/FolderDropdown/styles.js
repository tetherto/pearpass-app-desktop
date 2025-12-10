import styled, { css } from 'styled-components'

export const Label = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isHidden'].includes(prop)
})`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  white-space: nowrap;

  ${({ isHidden }) => {
    if (isHidden) {
      return css`
        opacity: 0;
        pointer-events: none;
        padding: 5px;
      `
    }
  }}
`

export const MainWrapper = styled.div`
  position: relative;
`

export const Wrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop)
})`
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.grey400.mode1};
  border: 1px solid
    ${({ theme, isOpen }) =>
      isOpen ? theme.colors.primary400.mode1 : theme.colors.grey100.mode1};
  padding: 5px;
  top: 0;
  left: 0;
  position: absolute;
  z-index: 5;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};

    & ${Label} path {
      stroke: ${({ theme }) => theme.colors.primary400.mode1};
    }
  }
`

export const DropDown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 5px 0 30px;
`

export const DropDownItem = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  cursor: pointer;
`

export const FolderIconWrapper = styled.div`
  flex-shrink: 0;
`
