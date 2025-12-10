import styled from 'styled-components'

export const NestedFoldersWrapper = styled.div`
  padding-left: ${({ level }) => `${level > 1 ? 30 : 0}px`};
`
