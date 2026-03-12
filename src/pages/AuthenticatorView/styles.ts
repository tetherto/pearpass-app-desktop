import styled from 'styled-components'

import { getTimerColor } from '../../components/OtpCodeField/utils'

interface GroupTimeValueProps {
  $expiring: boolean
}

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 13px;
`

export const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white.mode1};
  margin: 0;
`

export const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  padding: 60px 12px;
`


export const EmptyStateTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  width: 100%;
`

export const EmptyStateDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.grey100.mode1};
  line-height: 1.4;
  margin: 0;
`

export const EmptyStateCTAs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 350px;
`

export const EmptyStatePrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  background: ${({ theme }) => theme.colors.primary400.mode1};
  color: ${({ theme }) => theme.colors.grey500.mode1};
`

export const EmptyStateSecondaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  background: ${({ theme }) => theme.colors.grey300.mode1};
  color: ${({ theme }) => theme.colors.primary400.mode1};
`

export const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 10px 6px;
`

export const GroupLabel = styled.span`
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
`

export const GroupLabelText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
`

export const GroupTimeValue = styled.span.withConfig({
  shouldForwardProp: (prop) => !['$expiring'].includes(prop)
})<GroupTimeValueProps>`
  font-weight: 600;
  color: ${({ $expiring }) => getTimerColor($expiring)};
`

export const GroupDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.grey100.mode1}33;
  margin: 8px 10px 0;
`
