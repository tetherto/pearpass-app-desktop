import styled from 'styled-components'

export const TRANSITION_DURATION = 250

const TRANSFORM_BY_DIRECTION = {
  top: 'translate(-100%, calc(-100% - 10px))',
  right: 'translate(10px, -50%)',
  bottom: 'translate(-50%, 10px)',
  left: 'translate(10px, -50%)',
  topRight: 'translate(0, calc(-100% - 10px))',
  topLeft: 'translate(-100%, calc(-100% - 10px))',
  bottomRight: 'translate(0, 10px)',
  bottomLeft: 'translate(-100%, 10px)'
}

export const MenuWrapper = styled.div`
  position: relative;
  display: inline-block;
`

export const MenuCard = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    ![
      'direction',
      'isOpen',
      'top',
      'left',
      'height',
      'width',
      'shouldRender'
    ].includes(prop)
})`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  position: fixed;
  z-index: 1000;
  left: ${({ left }) => left}px;
  top: ${({ top }) => top}px;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ shouldRender }) => (shouldRender ? 'visible' : 'hidden')};
  transition:
    opacity ${TRANSITION_DURATION}ms ease-in-out,
    visibility ${TRANSITION_DURATION}ms ease-in-out;

  & {
    transform: ${({ direction }) => TRANSFORM_BY_DIRECTION[direction]};
  }

  @keyframes identifier {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

export const MenuTrigger = styled.div`
  cursor: pointer;
`
