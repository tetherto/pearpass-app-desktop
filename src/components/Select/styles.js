import styled from 'styled-components'

export const SelectWrapper = styled.div`
  position: relative;
`
export const SelectDropdown = styled.div`
  margin-top: 1px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  border-radius: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 7px 0;
`
