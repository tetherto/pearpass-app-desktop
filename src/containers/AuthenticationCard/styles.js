import styled from 'styled-components'

export const CardContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
  justify-content: center;
  width: 609px;
`

export const CardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
`

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`

export const ButtonWrapper = styled.div`
  align-self: center;
`
