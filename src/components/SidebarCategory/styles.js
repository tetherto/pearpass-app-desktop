import styled, { css } from 'styled-components'

export const CategoryButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['size', 'color', 'isSelected'].includes(prop)
})`
  display: flex;
  font-family: 'Inter';
  font-size: 16px;
  line-height: normal;
  flex-direction: row;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.grey400.mode1};
  border-radius: 10px;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.white.mode1};
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: ${({ color }) => color};
  }

  ${({ size }) =>
    size === 'default' &&
    css`
      flex: 1;
      min-width: 121px;
      padding: 10px 9px;
    `}

  ${({ size }) =>
    size === 'tight' &&
    css`
      width: 100%;
      padding: 5px 9px;
      align-items: center;
    `}
  
    ${({ isSelected, theme, color }) =>
    isSelected &&
    css`
      background: ${color};
      color: ${theme.colors.black.mode1};
    `}
`

export const CategoryDescription = styled.div`
  display: flex;
  gap: 2px;
  white-space: nowrap;
  font-weight: 600;
  width: 100%;
  text-align: left;

  ${({ size }) =>
    size === 'default' &&
    css`
      flex-direction: column;
    `}

  ${({ size }) =>
    size === 'tight' &&
    css`
      align-items: center;
      flex-direction: row;
    `}
`

export const CategoryIconWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSelected', 'color'].includes(prop)
})`
  display: flex;
`

export const CategoryName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`

export const CategoryQuantity = styled.span.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})`
  font-weight: 300;
  position: ${({ size }) => (size === 'default' ? 'absolute' : '')};
  top: ${({ size }) => (size === 'default' ? '8px' : '')};
  right: 9px;
`
