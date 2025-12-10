import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { html } from 'htm/react'

import {
  MenuCard,
  MenuTrigger,
  MenuWrapper,
  TRANSITION_DURATION
} from './styles'
import { getHorizontal } from './utils/getHorizontal'
import { getVertical } from './utils/getVertical'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import { toSentenceCase } from '../../utils/toSentenceCase'

/**
 * @param {{
 *  isOpen: boolean,
 *  setIsOpen: () => void,
 *  content: import('react').ReactNode,
 *  children: import('react').ReactNode,
 *  direction: 'top' | 'bottom' | 'left' | 'right' | 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'
 *  displayOnHover?: boolean
 * }} props
 */
export const PopupMenu = ({
  isOpen,
  setIsOpen,
  children,
  content,
  direction = 'bottomLeft',
  displayOnHover = false
}) => {
  const boxRef = useRef(null)

  const [shouldRender, setShouldRender] = useState(false)

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
  }, [setIsOpen])

  const wrapperRef = useOutsideClick({
    onOutsideClick: () => {
      handleClose()
    }
  })

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  const { newDirection, newPositions } = useMemo(() => {
    const {
      right = 0,
      left = 0,
      top = 0,
      bottom = 0
    } = boxRef.current?.getBoundingClientRect() || {}

    const width =
      boxRef.current?.children[0]?.getBoundingClientRect().width ?? 0
    const height =
      boxRef.current?.children[0]?.getBoundingClientRect().height ?? 0

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const positionToSet = {
      horizontal: getHorizontal(direction),
      vertical: getVertical(direction)
    }

    const rightPosition = screenWidth - right
    const leftPosition = left
    const topPosition = top
    const bottomPosition = screenHeight - bottom

    const newPositions = {
      right: rightPosition - (positionToSet.horizontal === 'right' ? width : 0),
      left: leftPosition - (positionToSet.horizontal === 'left' ? width : 0),
      top: topPosition - (positionToSet.vertical === 'top' ? height : 0),
      bottom:
        bottomPosition - (positionToSet.vertical === 'bottom' ? height : 0),
      width: width,
      height: height
    }

    if (newPositions.top < 0) {
      positionToSet.vertical = 'bottom'
    }

    if (newPositions.bottom < 0) {
      positionToSet.vertical = 'top'
    }

    if (newPositions.left < 0) {
      positionToSet.horizontal = 'right'
    }

    if (newPositions.right < 0) {
      positionToSet.horizontal = 'left'
    }

    return {
      newDirection: `${positionToSet.vertical}${
        positionToSet.vertical
          ? toSentenceCase(positionToSet.horizontal)
          : positionToSet.horizontal
      }`,
      newPositions: newPositions
    }
  }, [boxRef, direction, shouldRender])

  const contentOrigin = useMemo(() => {
    if (!wrapperRef.current) {
      return { top: 0, left: 0 }
    }

    const {
      top = 0,
      bottom = 0,
      left = 0,
      right = 0,
      width = 0,
      height = 0
    } = wrapperRef.current.getBoundingClientRect() || {}

    switch (newDirection) {
      case 'top':
        return {
          top: top,
          left: left + width / 2
        }
      case 'bottom':
        return {
          top: bottom,
          left: left + width / 2
        }
      case 'left':
        return {
          top: top + height / 2,
          left: left
        }
      case 'right':
        return {
          top: top + height / 2,
          left: right
        }
      case 'topRight':
        return { top: top, left: left }
      case 'topLeft':
        return { top: top, left: right }
      case 'bottomRight':
        return { top: bottom, left: left }
      case 'bottomLeft':
        return {
          top: bottom,
          left: right
        }
      default:
        return { top: 0, left: 0 }
    }
  }, [newDirection, wrapperRef, isOpen, shouldRender])

  const getScrollableAncestors = (element) => {
    const scrollableAncestors = []
    let parent = element.parentElement

    while (parent) {
      const overflowX = window.getComputedStyle(parent).overflowX
      const overflowY = window.getComputedStyle(parent).overflowY

      if (
        ['auto', 'scroll'].includes(overflowX) ||
        ['auto', 'scroll'].includes(overflowY)
      ) {
        scrollableAncestors.push(parent)
      }

      parent = parent.parentElement
    }

    return scrollableAncestors
  }

  useEffect(() => {
    if (!wrapperRef.current) {
      return
    }

    const scrollableAncestors = getScrollableAncestors(wrapperRef.current)

    if (isOpen) {
      window.addEventListener('scroll', handleClose)
      window.addEventListener('resize', handleClose)

      scrollableAncestors.forEach((ancestor) => {
        ancestor.addEventListener('scroll', handleClose)
      })
    }

    return () => {
      window.removeEventListener('scroll', handleClose)
      window.removeEventListener('resize', handleClose)

      scrollableAncestors.forEach((ancestor) => {
        ancestor.removeEventListener('scroll', handleClose)
      })
    }
  }, [wrapperRef, isOpen, handleClose])

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, TRANSITION_DURATION)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  return html`
    <${MenuWrapper}
      ref=${wrapperRef}
      onMouseEnter=${displayOnHover ? handleOpen : undefined}
      onMouseLeave=${displayOnHover ? handleClose : undefined}
    >
      <${MenuTrigger} onClick=${!displayOnHover && handleToggle}>
        ${children}
      <//>

      <${MenuCard}
        ref=${boxRef}
        direction=${newDirection}
        top=${contentOrigin.top}
        left=${contentOrigin.left}
        isOpen=${isOpen}
        shouldRender=${shouldRender}
        height=${newPositions.height}
        width=${newPositions.width}
      >
        ${content}
      <//>
    <//>
  `
}
