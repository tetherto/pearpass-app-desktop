import { html } from 'htm/react'

import { SideDrawerWrapper } from './styles'
import { BASE_TRANSITION_DURATION } from '../../../constants/transitions'
import { useAnimatedVisibility } from '../../../hooks/useAnimatedVisibility'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  isOpen: boolean
 * }} props
 */
export const SideDrawer = ({ children, isOpen }) => {
  const { isShown, isRendered } = useAnimatedVisibility({
    isOpen: isOpen,
    transitionDuration: BASE_TRANSITION_DURATION
  })

  if (!isRendered) {
    return null
  }

  return html` <${SideDrawerWrapper} isShown=${isShown}> ${children} <//> `
}
