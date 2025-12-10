import styled from 'styled-components'

export const DropAreaWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 83px;
  border-radius: 10px;
  width: 100%;
  border: 1px dashed ${({ theme }) => theme.colors.grey100.mode1};
  background: ${({ theme }) => theme.colors.grey400.mode1};
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
`

export const Label = styled.div`
  color: ${({ theme }) => theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
`

export const HiddenInput = styled.input`
  display: none;
`
