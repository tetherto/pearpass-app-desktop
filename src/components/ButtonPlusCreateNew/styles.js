import styled from 'styled-components'

export const Button = styled.button`
  display: flex;
  position: relative;
  width: 30px;
  height: 30px;
  padding: 5px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 15px;
  background: ${({ theme }) => theme.colors.primary400.mode1};
  border: none;
  cursor: pointer;
`
