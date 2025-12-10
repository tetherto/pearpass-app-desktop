import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  width: 480px;
  padding: 20px 26px;
  flex-direction: column;
  align-items: center;
  gap: 15px;

  border-radius: 10px;
  border: 1px solid rgba(172, 172, 172, 0.2);
  background: linear-gradient(133deg, rgba(77, 77, 77, 0.2) 0%, #303030 99.99%);
  box-shadow: 0px 0.5px 8px 0px rgba(255, 255, 255, 0.25) inset;
`

export const Text = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`

export const Header = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`

export const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const QrContainer = styled.div`
  width: 226px;
  height: 226px;
  border-radius: 10px;
  overflow: hidden;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.white.mode1};
`

export const QrImage = styled.img`
  width: 100%;
  height: 100%;
`

export const Content = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

export const ExpireText = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  gap: 5px;

  padding: 7px 10px;

  border-radius: 10px;
  background: ${({ theme }) => theme.colors.grey400.mode1};
`

export const ExpireTime = styled.span`
  color: ${({ theme }) => theme.colors.primary400.mode1};
`
