import styled, { css } from 'styled-components'

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;
`
export const PairingDescription = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
`

export const PairTabs = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 4px;
  width: 100%;
  border: 2px solid ${({ theme }) => theme.colors.grey100.mode1};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.primary400.mode1};
`

export const PairTab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 8px 14px;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease-in-out,
    color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
  background-color: transparent;
  border-radius: 7px;
  color: ${({ theme }) => theme.colors.primary400.mode1};
  ${({ $active }) =>
    $active &&
    css`
      background-color: ${({ theme }) => theme.colors.primary400.mode1};
      color: ${({ theme }) => theme.colors.black.dark};
    `}
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

export const PasteIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.black.dark};
  color: ${({ theme }) => theme.colors.primary400.mode1};
  padding: 9px 15px;
  cursor: pointer;
  gap: 7px;
  font-family: 'Inter';
  font-size: 12px;
`

export const InputFieldWrapper = styled.div`
  width: 100%;

  > div {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
`

export const LoadVaultNotice = styled.div`
  white-space: nowrap;
  width: 100%;
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: left;
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`
