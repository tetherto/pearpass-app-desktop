import styled from 'styled-components'

export const Wrapper = styled.div`
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.grey400.mode1};
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  padding: 10px;
  z-index: 5;
`

export const Label = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
`

export const ArrowIconWrapper = styled.div`
  display: flex;
  margin-left: auto;
`

export const DropDown = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 17px;
  padding: 10px 10px 0 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  margin-top: 10px;
`
