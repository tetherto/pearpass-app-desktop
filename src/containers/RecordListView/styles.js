import styled from 'styled-components'

export const ViewWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 13px;
`

export const ActionsSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`

export const LeftActions = styled.div`
  display: flex;
  gap: 10px;
`

export const RightActions = styled.div`
  display: flex;
`

export const Folder = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const RecordsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
`

export const DatePeriod = styled.div`
  color: ${({ theme }) => theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`
