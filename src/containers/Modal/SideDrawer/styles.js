import styled from 'styled-components'

import { BASE_TRANSITION_DURATION } from '../../../constants/transitions'

export const SideDrawerWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isShown'].includes(prop)
})`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 400px;
  height: calc(100% - var(--title-bar-height));
  background: ${({ theme }) => theme.colors.grey500.mode1};
  box-shadow: -4px 4px 4px 0px rgba(0, 0, 0, 0.25);
  transform: ${({ isShown }) =>
    isShown ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform ${BASE_TRANSITION_DURATION}ms ease-in-out;
`
