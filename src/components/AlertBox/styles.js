import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  width: 100%;
  padding: 10px;
  align-items: ${({ $isMultiLine }) =>
    $isMultiLine ? 'flex-start' : 'center'};
  gap: 8px;
  border-radius: 10px;
  border: 1px solid
    ${({ theme, type }) =>
      type === 'warning'
        ? theme.colors.errorYellow.mode1
        : theme.colors.errorRed.mode1};
  background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.8) 100%
    ),
    ${({ theme, type }) =>
      type === 'warning'
        ? theme.colors.errorYellow.mode1
        : theme.colors.errorRed.mode1};
`

export const Message = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
`

export const IconWrapper = styled.div`
  flex-shrink: 0;
`
