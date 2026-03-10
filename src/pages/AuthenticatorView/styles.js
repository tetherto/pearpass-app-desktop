import styled from 'styled-components'

import { getTimerColor } from '../../components/OtpCodeField/constants'

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
  color: ${({ theme }) => theme.colors.text1};
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
  gap: 8px;
  color: ${({ theme }) => theme.colors.text3};
  font-size: 14px;
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
})`
  font-weight: 600;
  color: ${({ theme, $expiring }) => getTimerColor(theme, $expiring)};
`

export const GroupDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.grey100.mode1}33;
  margin: 8px 10px 0;
`
