import styled from 'styled-components'

import { BASE_TRANSITION_DURATION } from '../../constants/transitions'

export const OverlayComponent = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isShown'].includes(prop)
})`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ isShown }) => (isShown ? 1 : 0)};
  transition: opacity ${BASE_TRANSITION_DURATION}ms ease-in-out;
  background: ${({ type }) => {
    if (type === 'default') {
      return 'rgba(35, 35, 35, 0.6)'
    }

    if (type === 'blur') {
      return 'rgba(0, 0, 0, 0.5)'
    }
  }};
  backdrop-filter: ${({ type }) => {
    if (type === 'default') {
      return 'none'
    }

    if (type === 'blur') {
      return 'blur(10px)'
    }
  }};
`
