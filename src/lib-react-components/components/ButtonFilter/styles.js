import styled, { css } from 'styled-components'

const getDisabledGradient = (theme) =>
  `linear-gradient(0deg, rgba(5, 11, 6, 0.40) 0%, rgba(5, 11, 6, 0.40) 100%), ${theme.colors.secondary200.mode1};`

export const Button = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDisabled'].includes(prop)
})`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};

  ${({ variant, theme, isDisabled }) => {
    if (variant === 'primary') {
      return css`
        border-radius: 10px;
        background: ${isDisabled
          ? getDisabledGradient(theme)
          : theme.colors.secondary200.mode1};
        padding: 4px;
        color: ${theme.colors.secondary400.mode1};

        & svg path {
          fill: ${theme.colors.secondary400.mode1};
        }

        &:hover {
          background: ${theme.colors.secondary100.mode1};
        }
      `
    }

    if (variant === 'secondary') {
      return css`
        border-radius: 10px;
        background: ${theme.colors.grey500.mode1};
        padding: 5px 8px;
        color: ${theme.colors.white.mode1};

        & svg path {
          fill: ${theme.colors.white.mode1};
        }

        &:hover {
          background: ${theme.colors.grey100.mode1};
          color: ${theme.colors.black.mode1};

          & svg path {
            fill: ${theme.colors.black.mode1};
          }
        }
      `
    }
  }};
`
