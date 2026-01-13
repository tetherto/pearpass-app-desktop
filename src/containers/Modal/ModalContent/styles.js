import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 640px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '10px'};
  border: 1px solid
    ${({ theme, $borderColor }) => $borderColor ?? theme.colors.grey300.dark};
  background: ${({ theme }) => theme.colors.grey500.dark};
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  position: relative;
`
