import styled from 'styled-components'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
  justify-content: center;
  width: 500px;
`

export const CardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
`

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`

export const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
`

export const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`

export const Label = styled.label`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 25px;
  align-self: center;
`

export const AccordionTrigger = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > button {
    transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
    transition: transform 0.3s ease;
  }
`

export const AccordionContent = styled.div`
  display: flex;
  max-height: ${({ isOpen }) => (isOpen ? '200px' : '0')};
  overflow: hidden;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  transition: max-height 0.3s ease;
`
