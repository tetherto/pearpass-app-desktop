import styled from 'styled-components'

export const Title = styled.div`
  font-family: 'Inter';
  font-size: 12px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-weight: 400;
`

export const SwitchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`

export const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter';
  font-size: 14px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-weight: 600;
  margin-top: 10px;
`

export const InfoCard = styled.div`
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.grey500.mode1};
  border-radius: 10px;
`

export const InfoCardTitle = styled.div`
  font-family: 'Inter';
  font-size: 14px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-weight: 500;
`

export const InfoCardText = styled.div`
  font-family: 'Inter';
  font-size: 16px;
  color: ${({ theme }) => theme.colors.grey200.mode1};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-top: 20px;
  gap: 15px;
`

export const InputWrapper = styled.div`
  margin-top: 10px;
  width: 100%;
`
