import styled from 'styled-components'

export const CompoundFieldComponent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isDisabled'].includes(prop)
})`
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.dark};
  background-color: ${({ theme }) => theme.colors.grey400.dark};

  &:hover {
    border-color: ${({ theme, isDisabled }) =>
      isDisabled ? theme.colors.grey100.dark : theme.colors.primary300.mode1};
  }
  max-height: 100%;
  overflow-y: auto;
`
