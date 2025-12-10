import styled from 'styled-components'

export const ContentWrapper = styled.div`
  width: 100%;
`

export const HiddenInput = styled.input`
  display: none;
`

export const FileSizeWarning = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`
