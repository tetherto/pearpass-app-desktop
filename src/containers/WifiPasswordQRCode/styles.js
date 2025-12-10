import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  display: flex;
  padding: 20px 10px;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  align-self: stretch;

  border-radius: 10px;
  background: ${({ theme }) => theme.colors.grey500.mode1};
`

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};

  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`

export const QrContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const QRCode = styled.div`
  width: 226px;
  height: 226px;
  padding: 15px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.white.mode1};
`
