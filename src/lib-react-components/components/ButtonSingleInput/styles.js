import styled from 'styled-components'

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  width: fit-content;
  display: inline-flex;
  padding: 5px 10px;
  border: 1px solid
    ${({ theme, variant }) =>
      variant === 'bordered'
        ? theme.colors.primary400.mode1
        : theme.colors.black.mode1};
  align-items: center;
  gap: 7px;
  border-radius: 10px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.black.mode1};
  color: ${({ theme }) => theme.colors.primary400.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;

  & svg path {
    fill: ${({ theme }) => theme.colors.primary400.mode1};
  }

  &:hover {
    border-color: 1px solid ${({ theme }) => theme.colors.primary400.mode1};
  }
`
