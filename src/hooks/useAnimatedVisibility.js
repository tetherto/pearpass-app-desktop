import { useEffect, useState } from 'react'

import { BASE_TRANSITION_DURATION } from '../constants/transitions'

/**
 * @param {{
 *  isOpen: boolean
 *  transitionDuration?: number
 * }} transitionDuration
 * @returns {{
 *  isShown: boolean
 *  isRendered: boolean
 * }}
 */
export const useAnimatedVisibility = ({
  isOpen,
  transitionDuration = BASE_TRANSITION_DURATION
}) => {
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsShown(false)
      }, transitionDuration)

      return
    }

    setIsShown(true)
  }, [isOpen])

  return { isShown: isShown && isOpen, isRendered: isShown || isOpen }
}
