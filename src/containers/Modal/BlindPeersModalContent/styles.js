import styled from 'styled-components'

export const HeaderWrapper = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 700;
`

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

export const FormWrapper = styled.div`
  max-height: 400px;
  overflow-y: auto;
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  max-height: ${({ isOpen }) => (isOpen ? '300px' : '0')};
  transition: max-height 0.5s ease;
`

export const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
