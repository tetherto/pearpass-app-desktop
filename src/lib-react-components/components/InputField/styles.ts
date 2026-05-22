import styled from 'styled-components'

interface InputProps {
    hasOverlay?: boolean
    isDisabled?: boolean
    type?: string
}

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
  border-color: #bababa;
  border-bottom: none;
  background: #303030;
  margin-top: 0;
  padding: 8px 10px;

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border-bottom: 1px solid #bababa;
  }

  &:hover,
  &:focus-within {
    border-color: #bade5b;
  }

  &:hover + &,
  &:focus-within + & {
    border-top-color: #bade5b;
  }
`

export const DefaultInputWrapper = styled(InputWrapper)`
  &:not(:first-child) {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #bababa;
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
  color: #f6f6f6;
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

const getInputColor = (params: {
    theme: { colors: Record<string, Record<string, string>> }
    type?: string
    hasOverlay?: boolean
}): string => {
    const { type, hasOverlay } = params

    if (hasOverlay) {
        return 'transparent'
    }

    if (type === 'url') {
        return "#BADE5B"
    }

    return "#F6F6F6"
}

export const Input = styled.input.withConfig({
    shouldForwardProp: (prop) => !['hasOverlay', 'isDisabled'].includes(prop)
}) <InputProps>`
  color: ${({ theme, type, hasOverlay }) =>
        getInputColor({ theme, type, hasOverlay })};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 700;
  caret-color: ${({ hasOverlay }) =>
        hasOverlay ? '#bade5b' : ''};
  width: 100%;
  user-select: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'text')};

  &::selection {
    color: ${({ hasOverlay }) => (hasOverlay ? 'transparent' : '')};
  }

  &::placeholder {
    color: #bababa;
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
