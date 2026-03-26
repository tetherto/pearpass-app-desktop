import styled from 'styled-components'

import { isV2 } from '../../../utils/designVersion'

export const CategoriesContainer = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-between;
  row-gap: ${({ size }) => (size === 'default' ? '8px' : '10px')};
  column-gap: 12px;
  ${isV2() && 'flex-shrink: 0;'}
`
