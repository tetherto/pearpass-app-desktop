import styled from 'styled-components'

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  justify-content: center;
  width: 480px;
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

export const VaultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  overflow: scroll;
  max-height: 35vh;
`

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 25px;
  align-self: center;
`

export const ImportContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
`

export const ImportText = styled.span`
  color: ${({ theme }) => theme.colors.primary400.mode1};
  cursor: pointer;
  text-align: center;
  align-self: center;
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
`
export const CardNoVaultsText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};

  margin: 0 auto;
  width: 293px;
  text-align: center;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`
