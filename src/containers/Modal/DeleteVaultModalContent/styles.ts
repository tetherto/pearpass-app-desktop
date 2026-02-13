import styled from 'styled-components'

export const ModalHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`
export const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: left;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-bottom: 10px;
`
export const ModalDescription = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== 'marginBottom'
})<{
  marginBottom?: number
}>`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: left;
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: ${({ marginBottom }) => marginBottom ?? 0}px;
`
export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25;
  width: 100%;
`
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 25px;
`
export const InputLabel = styled.label`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`
export const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  width: 100%;
  button {
    flex: 1;
  }
  & > button:last-child {
    border: none;
  }
`

export const DevicesList = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isConfirmStep'
})<{
  isConfirmStep?: boolean
}>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 25px;
`

export const DeviceItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSelected', 'isDisabled'].includes(prop)
})<{
  isSelected?: boolean
  isDisabled?: boolean
}>`
  display: flex;
  align-items: center;
  padding: 10px;
  width: 100%;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.grey350.mode1 : theme.colors.grey400.mode1};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.white.mode1} !important;
  gap: 10px;
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.7 : 1)};
  border: 1px solid
    ${({ theme, isSelected, isDisabled }) =>
      isSelected && !isDisabled
        ? theme.colors.primary400.mode1
        : 'transparent'};

  &:hover {
    border-color: ${({ theme, isDisabled }) =>
      isDisabled ? 'transparent' : theme.colors.primary400.mode1};
  }
`

export const CheckIconWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== '$isCurrentDevice'
})<{
  $isCurrentDevice?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 8px;
  background-color: ${({ theme, $isCurrentDevice }) =>
    $isCurrentDevice
      ? theme.colors.grey300.mode1
      : theme.colors.primary400.mode1};
`

export const DeleteVaultButton = styled.button`
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.errorRed.mode1};
  color: ${({ theme }) => theme.colors.white.mode1};
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Inter';
  font-weight: 600;
  line-height: 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  & svg path {
    fill: ${({ theme }) => theme.colors.white.mode1};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.errorRed.mode1};
  }

  &:active {
    background: ${({ theme }) => theme.colors.errorRed.mode1};
  }
`
