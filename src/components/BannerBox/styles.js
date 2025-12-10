import styled from 'styled-components'

export const Container = styled.div`
  position: absolute;
  display: flex;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  gap: 10px;
  width: min(90%, 507px);
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;

  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.primary400.mode1};
  background-color: ${({ theme }) => theme.colors.grey400.mode1};
`

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`

export const Message = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`
export const HighlightedDescription = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`

export const CloseButtonWrapper = styled.div`
  display: flex;
  top: -15px;
  right: -15px;
  position: absolute;
`
