import styled from 'styled-components'

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  position: relative;

  border-radius: 10px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colors.grey100.mode1};
  margin-top: 0;
  padding: 10px 10px;

  &:hover,
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`

export const MainWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const InputAreaWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow-x: auto;
  white-space: nowrap;
  display: flex;
  align-items: center;
`

export const Input = styled.input`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 700;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey100.mode1};
  }
`

export const NoticeWrapper = styled.div`
  margin-top: 2px;
`
