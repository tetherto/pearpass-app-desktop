import styled from 'styled-components'

export const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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
