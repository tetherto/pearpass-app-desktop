import styled from 'styled-components'

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  position: relative;
`

export const OutlineInputWrapper = styled(InputWrapper)`
  border: 1px solid;
  border-color: ${({ theme }) => theme.colors.grey100.mode1};
  border-bottom: none;
  background: ${({ theme }) => theme.colors.grey400.mode1};
  margin-top: 0;
  padding: 8px 10px;

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  }

  &:hover,
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }

  &:hover + &,
  &:focus-within + & {
    border-top-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`

export const DefaultInputWrapper = styled(InputWrapper)`
  &:not(:first-child) {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  }
`

export const InsideWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  align-items: center;
  gap: 10px;
  width: 100%;
  position: relative;
`

export const IconWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-top: 9px;
`

export const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const Label = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
`

export const InputAreaWrapper = styled.div`
  position: relative;
  margin-top: 5px;
  overflow-x: auto;
  white-space: nowrap;
  display: flex;
  align-items: center;
`

const getInputColor = ({ theme, type, hasOverlay }) => {
  if (hasOverlay) {
    return 'transparent'
  }

  if (type === 'url') {
    return theme.colors.primary400.mode1
  }

  return theme.colors.white.mode1
}

export const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => !['hasOverlay', 'isDisabled'].includes(prop)
})`
  color: ${({ theme, type, hasOverlay }) =>
    getInputColor({ theme, type, hasOverlay })};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 700;
  caret-color: ${({ theme, hasOverlay }) =>
    hasOverlay ? theme.colors.primary400.mode1 : ''};
  width: 100%;
  user-select: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'text')};

  &::selection {
    color: ${({ hasOverlay }) => (hasOverlay ? 'transparent' : '')};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey100.mode1};
  }
`

export const InputOverlay = styled.div`
  position: absolute;
  top: 0;
  left: -6px;
  width: 100%;
  height: 100%;
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 700;
  z-index: 1;
  pointer-events: none;
  display: flex;
  align-items: center;
  padding: 8px;
  white-space: nowrap;

  & span {
    display: flex;
    white-space: nowrap;
  }
`

export const NoticeWrapper = styled.div`
  margin-top: 2px;
`

export const AdditionalItems = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  align-self: center;
`
