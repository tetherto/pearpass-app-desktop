import styled from 'styled-components'

export const ToastStack = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 23.5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
`

export const ToastContainer = styled.div`
  display: flex;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
  gap: 7px;

  border-radius: 10px;
  background: ${({ theme }) => theme.colors.white.mode1};
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.25);

  color: ${({ theme }) => theme.colors.black.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`
