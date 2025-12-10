import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  position: relative;
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

export const InputAreaWrapper = styled.div`
  position: relative;
  margin-top: 5px;
  overflow-x: auto;
  white-space: nowrap;
  display: flex;
  align-items: center;
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
  min-width: 0;
`

export const AttachmentName = styled.a`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 700;
  padding: 1px 0px;
  height: 21.5px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export const Label = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
`

export const AdditionalItems = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  align-self: center;
`
