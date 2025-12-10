import styled from 'styled-components'

export const PassPraseSettingsContainer = styled.div`
  font-size: 12px;
  background-color: ${({ theme }) => theme.colors.grey350.mode1};
  border-radius: 10px;
  padding: 10px;
  gap: 15px;
  display: flex;
  flex-direction: column;
`

export const PassPraseSettingsTitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: Inter;
`

export const PassPraseSettingsRandomWordContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

export const PassPraseSettingsRandomWordText = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: Inter;
`

export const SwitchWrapper = styled.div`
  transform: scale(1.2);
`

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.grey400?.mode1};
  border: 1px solid ${({ theme }) => theme.colors.grey100?.mode1};
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const PassPhraseHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const HeaderText = styled.span`
  color: ${({ theme }) => theme.colors.white?.mode1};
  font-family: Inter;
  font-size: 12px;
  font-weight: 400;
`

export const CopyPasteButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${({ isPaste }) => (isPaste ? '10px' : '5px')};
  color: ${({ theme }) => theme.colors.primary400?.mode1};
  background: transparent;
  border: none;
  cursor: pointer;
  margin-bottom: ${({ withExtraBottomSpace }) =>
    withExtraBottomSpace ? '10px' : '0'};
`

export const CopyPasteText = styled.span`
  color: ${({ theme }) => theme.colors.primary400?.mode1};
  font-family: Inter;
  font-size: 14px;
  text-align: center;
  display: inline-flex;
`

export const PassPhraseContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  row-gap: 15px;
  justify-content: space-around;
`

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`

export const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.categoryIdentity.mode1};
  font-family: Inter;
  font-size: 10px;
  font-weight: 500;
`
