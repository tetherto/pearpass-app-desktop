import styled from 'styled-components'

export const ButtonRadio = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isActive'].includes(prop)
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  border-radius: 50%;
  background: transparent;
  border: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary400.mode1 : theme.colors.primary300.mode1};
  padding: 2px;
  cursor: pointer;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary400.mode1};
    opacity: ${({ isActive }) => (isActive ? 1 : 0)};
    transition: opacity 300ms ease-in-out;
  }
`
