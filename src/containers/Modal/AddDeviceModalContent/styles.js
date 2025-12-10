import styled from 'styled-components'

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`

export const QRCodeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`

export const QRCodeText = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
`

export const QRCodeCopy = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`
export const QRCodeCopyWrapper = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

export const QRCode = styled.div`
  width: 226px;
  height: 226px;
  padding: 15px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.white.mode1};
`

export const BackgroundSection = styled.div`
  max-width: 100%;
  display: flex;
  padding: 7px 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.grey400.mode1};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`

export const ExpireText = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
`

export const ExpireTime = styled.span`
  color: ${({ theme }) => theme.colors.primary400.mode1};
`

export const CopyText = styled.div`
  color: ${({ theme }) => theme.colors.grey200.mode1};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  width: 100%;
`

export const WarningSection = styled.div`
  display: flex;
  padding: 10px;
  align-items: flex-start;
  gap: 8px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.errorYellow.mode1};
  background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.8) 100%
    ),
    ${({ theme }) => theme.colors.errorYellow.mode1};
`

export const WarningText = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
`

export const IconWrapper = styled.div`
  flex-shrink: 0;
`
