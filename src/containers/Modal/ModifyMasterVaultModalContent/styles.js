import styled from 'styled-components'

export const ModalContentWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  width: 480px;
  background-color: ${({ theme }) => theme.colors.grey500.mode1};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.grey400.mode1};
  box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.25);
  z-index: 10;
`

export const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`
export const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`

export const CloseButton = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
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
  gap: 25px;
  align-items: center;
  width: 100%;
`
