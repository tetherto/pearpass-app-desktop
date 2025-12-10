import styled, { css } from 'styled-components'

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isIconOnly'].includes(prop)
})`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ isIconOnly }) => (isIconOnly ? '50%' : '10px')};
  padding: 4px 10px;
  gap: 5px;
  cursor: pointer;
  font-weight: 500;
  font-family: 'Inter';

  ${({ variant, theme }) => {
    if (variant === 'primary') {
      return css`
        background: ${theme.colors.primary300.mode1};
        color: ${theme.colors.black.mode1};
        border: 1px solid ${theme.colors.primary300.mode1};

        & svg path {
          fill: ${theme.colors.black.mode1};
        }

        &:hover {
          border: 1px solid ${theme.colors.primary400.mode1};
          background: ${theme.colors.primary400.mode1};
        }
      `
    }

    if (variant === 'secondary') {
      return css`
        background: ${theme.colors.black.mode1};
        color: ${theme.colors.primary300.mode1};
        border: 1px solid ${theme.colors.black.mode1};

        & svg path {
          fill: ${theme.colors.primary300.mode1};
        }

        &:hover {
          border-color: ${theme.colors.primary400.mode1};
          color: ${theme.colors.primary400.mode1};

          & svg path {
            fill: ${theme.colors.primary400.mode1};
          }
        }
      `
    }
  }};
`
