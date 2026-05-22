import styled, { css } from 'styled-components'

interface TextAreaStyledProps {
  isDisabled?: boolean
  hasAdditionalItems?: boolean
}

const textareaBaseStyles = css<TextAreaStyledProps>`
  width: 100%;
  pointer-events: auto;
  cursor: ${({ isDisabled }) => (isDisabled ? 'pointer' : 'text')};
  user-select: ${({ isDisabled }) => (isDisabled ? 'none' : 'text')};
  font-family: 'Inter';
  font-weight: 700;
  resize: none;
  outline: none;
  background: #303030;
  color: #f6f6f6;
  border: 1px solid #bababa;
  border-radius: 10px;
  padding: 8px 10px;
  padding-right: ${({ hasAdditionalItems }) => (hasAdditionalItems ? '40px' : '10px')};

  &::placeholder {
    color: #bababa;
  }

  &::selection {
    background: #bade5b;
    color: #f6f6f6;
  }

  &:focus {
    outline: none;
    border-color: #bade5b;
  }
`

export const TextAreaComponent = styled.textarea.withConfig({
  shouldForwardProp: (prop: string) => !['isDisabled', 'hasAdditionalItems'].includes(prop)
}) <TextAreaStyledProps>`
  ${textareaBaseStyles}
  height: 233px;
  font-size: 16px;
`

export const ReportTextAreaComponent = styled.textarea.withConfig({
  shouldForwardProp: (prop: string) => !['isDisabled', 'hasAdditionalItems'].includes(prop)
}) <TextAreaStyledProps>`
  ${textareaBaseStyles}
  height: 70px;
  padding: 11px 12px;
  padding-right: ${({ hasAdditionalItems }) => (hasAdditionalItems ? '50px' : '12px')};
  font-size: 12px;
  font-weight: 600;

  &::placeholder {
    color: #666666;
  }
`

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
`

export const TextAreaWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
`

export const AdditionalItemsWrapper = styled.div`
  position: absolute;
  top: 8px;
  right: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 10px;
  flex-shrink: 0;
  z-index: 2;
  pointer-events: auto;
`
