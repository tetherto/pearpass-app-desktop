// styles.ts
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
  background: ${({ theme }) => theme.colors.grey400.mode1};
  color: ${({ theme }) => theme.colors.white.mode1};
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  border-radius: 10px;
  padding-right: ${({ hasAdditionalItems }) => (hasAdditionalItems ? '45px' : '10px')};

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey100.mode1};
  }

  &::selection {
    background: ${({ theme }) => theme.colors.primary400.mode1};
    color: ${({ theme }) => theme.colors.white.mode1};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`

export const TextAreaComponent = styled.textarea.withConfig({
  shouldForwardProp: (prop: string) => !['isDisabled', 'hasAdditionalItems'].includes(prop)
}) <TextAreaStyledProps>`
  ${textareaBaseStyles}
  height: 233px;
  padding: 8px 10px;
  font-size: 16px;
`

export const ReportTextAreaComponent = styled.textarea.withConfig({
  shouldForwardProp: (prop: string) => !['isDisabled', 'hasAdditionalItems'].includes(prop)
}) <TextAreaStyledProps>`
  ${textareaBaseStyles}
  height: 70px;
  padding: 11px 12px;
  font-size: 12px;
  font-weight: 600;

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey300.mode1};
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
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  z-index: 2;
  pointer-events: auto;
`
