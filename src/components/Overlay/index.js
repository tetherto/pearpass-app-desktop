import { html } from 'htm/react'

import { OverlayComponent } from './styles'
import { BASE_TRANSITION_DURATION } from '../../constants/transitions'
import { useAnimatedVisibility } from '../../hooks/useAnimatedVisibility'

/**
 * @param {{
 *  isOpen: boolean
 *  onClick: () => void
 *  type: 'default' | 'blur'
 * }} props
 */
export const Overlay = ({ isOpen, onClick, type = 'default' }) => {
  const { isShown, isRendered } = useAnimatedVisibility({
    isOpen: isOpen,
    transitionDuration: BASE_TRANSITION_DURATION
  })

  if (!isRendered) {
    return null
  }

  return html`
    <${OverlayComponent}
      type=${type}
      isShown=${isShown}
      onClick=${() => onClick?.()}
    />
  `
}
