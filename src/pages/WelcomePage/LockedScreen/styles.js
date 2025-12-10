import styled from 'styled-components'

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`

export const Title = styled.h2`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`

export const Description = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;
`

export const TimerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  align-items: center;
  width: 600px;
  padding: 7px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
`

export const TimerLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 400;
`

export const TimerValue = styled.span`
  color: ${({ theme }) => theme.colors.primary400.mode1};
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
`
