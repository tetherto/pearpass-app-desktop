import styled from 'styled-components'

export const Container = styled.div`
  position: relative;
  display: flex;
  width: 380px;
  padding: 20px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
  background: ${({ theme }) => theme.colors.grey400.mode1};
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
`

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.32px;
`

export const Description = styled.span`
  color: ${({ theme }) => theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 21px */
  letter-spacing: -0.28px;
`

export const ButtonWrapper = styled.div`
  display: flex;
  width: 100%;

  & > * {
    width: 100%;
  }
`

export const TimerWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const TimerTitle = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 150%; /* 21px */
  letter-spacing: -0.28px;
`

export const Timer = styled.span`
  color: ${({ theme }) => theme.colors.primary400.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 21px */
  letter-spacing: -0.28px;
`
