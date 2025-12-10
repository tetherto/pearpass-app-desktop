import styled, { css } from 'styled-components'

export const Button = styled.div`
  width: fit-content;
  height: auto;
  display: inline-flex;
  padding: 5px 10px;
  border: 1px solid transparent;
  align-items: center;
  gap: 7px;
  border-radius: 10px;
  cursor: pointer;

  ${({ variant, theme }) => {
    if (variant === 'black') {
      return css`
        background: ${theme.colors.black.mode1};
        color: ${theme.colors.primary300.mode1};

        & svg path {
          fill: ${theme.colors.primary300.mode1};
        }

        &:hover {
          border: 1px solid ${theme.colors.primary400.mode1};
          color: ${theme.colors.primary400.mode1};

          & svg path {
            fill: ${theme.colors.primary400.mode1};
          }
        }
      `
    }

    if (variant === 'grey') {
      return css`
        background: ${theme.colors.grey300.mode1};
        color: ${theme.colors.white.mode1};
      `
    }
  }};
`
