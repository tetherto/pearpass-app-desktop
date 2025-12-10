import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  width: 150px;
  height: 100px;
  padding: 14px 2px;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  cursor: pointer;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
`

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`

export const AcceptedTypes = styled.span`
  color: ${({ theme }) => theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`
