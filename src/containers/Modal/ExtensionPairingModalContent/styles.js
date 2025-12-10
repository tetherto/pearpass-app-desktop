import styled from 'styled-components'

export const ModalContainer = styled.div`
  position: relative;
  display: flex;
  width: 480px;
  padding: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 15px;

  border-radius: 20px;
  border: 1px ${({ theme }) => theme.colors.grey300.mode1};
  background: ${({ theme }) => theme.colors.grey500.mode1};
  box-shadow: 5px 5px 10px 0 rgba(0, 0, 0, 0.25);
`

export const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  align-self: stretch;
`

export const ModalTitle = styled.p`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`

export const ModalDescription = styled.p`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
`

export const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 25px;
  align-self: stretch;
`
