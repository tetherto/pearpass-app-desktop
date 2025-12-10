import styled from 'styled-components'

export const Label = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  border-radius: 10px;
  padding: 7px 10px;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  cursor: pointer;
  white-space: nowrap;
`
