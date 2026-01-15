import styled from 'styled-components'

export const BackButtonTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const RoundIconButton = styled.button`
  display: inline-flex;
  width: 42px;
  height: 42px;
  padding: 9px;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.black.mode1};
  border-radius: 30px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.black.mode1};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary400.mode1};
  }
`

export const BackButton = styled(RoundIconButton)`
  & svg {
    transform: rotate(90deg);
  }
`

export const HeaderTitle = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 700;
`

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  min-height: 62px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.grey400.mode1};
`

export const VaultNameRow = styled(InputRow)`
  padding: 14px 16px;
`

export const InputRowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`

export const InputIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

export const InputText = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 700;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey100.mode1};
    font-weight: 700;
  }
`

export const Label = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 700;
`

export const AccordionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const AccordionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

export const RoundArrowButton = styled(RoundIconButton)`
  & svg {
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
    transition: transform 0.2s ease;
  }
`

export const IconOnlyButton = styled.button`
  display: inline-flex;
  width: 42px;
  height: 42px;
  padding: 9px;
  justify-content: center;
  align-items: center;
  border: none;
  background: transparent;
  border-radius: 30px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`

export const AccordionFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const AccordionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;

  padding-top: ${({ $isOpen }) => ($isOpen ? '10px' : '0')};
  max-height: ${({ $isOpen }) => ($isOpen ? '520px' : '0')};

  transition:
    max-height 0.25s ease,
    padding-top 0.25s ease;
`

export const PasswordRowRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`

export const PasswordStrength = styled.div.withConfig({
  shouldForwardProp: (prop) => !['strength'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 5px;

  color: ${({ theme, strength }) => {
    switch (strength) {
      case 'safe':
        return theme.colors.primary400.mode1
      case 'vulnerable':
        return theme.colors.errorRed.dark
      case 'weak':
        return theme.colors.errorYellow.mode1
      default:
        return theme.colors.white.mode1
    }
  }};

  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
`

export const PasswordErrorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  width: 100%;

  font-family: 'Inter';
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.errorRed.mode1};
`

export const PasswordRequirements = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
`

export const RequirementsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
`

export const RequirementsItem = styled.li`
  font-size: 12px;
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
`

export const ContinueButtonWrapper = styled.div`
  flex: 1;
  max-width: 260px;

  & > button {
    width: 100%;
    height: 42px;
    max-width: 260px;
    padding: 9px 40px;
    font-size: 14px;
    font-weight: 700;
  }
`

export const CancelButton = styled.button`
  flex: 1;
  max-width: 260px;
  height: 42px;
  min-height: 42px;
  padding: 9px 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  border: none;
  cursor: pointer;

  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 700;
  line-height: 17px;

  &:hover {
    opacity: 0.9;
  }
`
