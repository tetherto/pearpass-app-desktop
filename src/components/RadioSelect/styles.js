import styled from 'styled-components'

export const RadioSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

export const Title = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;
`

export const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  margin-top: 10px;

  & + & {
    margin-top: 5px;
  }
`
