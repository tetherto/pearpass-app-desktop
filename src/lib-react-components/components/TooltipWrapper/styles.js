import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  width: max-content;
  flex-direction: column;
  border-radius: 10px;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors.grey500.mode1};
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`
