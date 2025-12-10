import styled from 'styled-components'

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  max-height: ${({ isOpen }) => (isOpen ? '500px' : '35px')};
  transition: all 0.3s ease;
`

export const Container = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  gap: 7px;
  padding: 5px 7px;
  align-items: center;
  border-radius: 10px;
  border: 1px solid;
  border-color: ${({ theme, isOpen }) =>
    isOpen ? theme.colors.primary400.mode1 : 'transparent'};
  background-color: ${({ theme }) => theme.colors.black.mode1};
  user-select: none;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;

  & > span {
    flex: 1;
  }

  z-index: 2;
`

export const ArrowIconWrapper = styled.div`
  display: flex;
  margin-left: auto;
`

export const Dropdown = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.black.mode1};
  margin-top: -20px;
  padding: 5px 7px;
  padding-top: 30px;
  border-radius: 10px;
  overflow: hidden;
  flex-direction: column;
  z-index: 2;
  max-height: ${({ isOpen }) => (isOpen ? '500px' : '0')};
  display: 'flex';
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  transition: all 0.3s ease;
`

export const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0px;
  gap: 7px;

  cursor: pointer;

  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  }
`
