import styled from 'styled-components'

export const Container = styled.div`
  display: inline-flex;
  justify-content: center;
  padding: 10px;
  align-items: center;
  gap: 8px;

  border-radius: 10px;
  border: 1px solid #bd8610;
  background: linear-gradient(
    0deg,
    #bd8610 -14.1%,
    rgba(70, 70, 70, 0.05) 125.68%
  );
  box-shadow:
    4px 4px 12px 0px rgba(216, 216, 216, 0.5),
    0px 0.5px 4px 0px rgba(255, 255, 255, 0.25) inset;
  backdrop-filter: blur(7px);

  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`
