import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

export const LearnMoreLink = styled.a`
  font-family: 'Inter';
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary400.mode1};
  font-weight: 700;
  text-decoration: none;

  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    text-decoration: underline;
  }
`

export const TooltipContent = styled.div`
  font-family: 'Inter';
  font-size: 14px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.white.mode1};

  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 400px;
`

export const TooltipText = styled.div`
  display: flex;
  flex-direction: column;
`

export const ListContainer = styled.ul`
  margin: 10px 0;
  padding-left: 20px;
  list-style-type: disc;
`

export const YourPeersSection = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
`

export const YourPeersTitle = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter';
`

export const PeerTypeCard = styled.div`
  display: flex;
  width: 100%;
  padding: 10px 15px;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`

export const PeerTypeText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter';
`

export const ActiveIndicator = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

export const ActiveDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary400.mode1};
`

export const ActiveText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-size: 12px;
  font-family: 'Inter';
  font-weight: 400;
`

export const PeerCountDivider = styled.div`
  width: 1px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.grey100.mode1};
`

export const PeerCountText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-size: 12px;
  font-family: 'Inter';
  font-weight: 400;
`
