import styled from 'styled-components'

export const ButtonContainer = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  padding: 8px;
  background: ${({ theme }) => theme.colors.primary300.mode1};
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.primary400.mode1};
  }
`

export const IconWrapper = styled.div`
  display: flex;
`
