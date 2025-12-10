import styled from 'styled-components'

export const SidebarSearchContainer = styled.div`
  height: 29px;
  font-family: 'Inter';
  font-size: 16px;
  display: flex;
  align-items: center;
  padding: 5px 30px;
  position: relative;
`

export const SearchLabelIcon = styled.label`
  position: absolute;
  left: 4px;

  & path {
    stroke: ${({ theme }) => theme.colors.primary400.mode1};
  }
`

export const SearchInput = styled.input`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.white.mode1};
  padding: 0;
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey200.mode1};
  }

  &:focus {
    border: none;
    box-shadow: none;
    outline: none;
  }

  &::-webkit-search-cancel-button {
    appearance: none;
  }
`
