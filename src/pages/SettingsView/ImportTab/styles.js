import styled from 'styled-components'

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

export const Description = styled.span`
  font-size: 12px;
  font-weight: 400;
  font-family: 'Inter';
  color: ${({ theme }) => theme.colors.white.mode1};
`

export const ActionsContainer = styled.div`
  display: flex;
  justify-content: start;
  gap: 10px;
`

export const ImportOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 20px;
  column-gap: 36px;
`

export const ModalTitle = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;
`

export const PasswordInput = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-size: 14px;
  outline: none;
`

export const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.errorRed.mode1};
  font-size: 12px;
`
