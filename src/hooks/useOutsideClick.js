import { useEffect, useRef } from 'react'

/**
 * @typedef UseOutsideClickParams
 * @property {(event: Event) => void} onOutsideClick
 */

/**
 * @param {UseOutsideClickParams} params
 * @returns {import('react').MutableRefObject<null>}
 */

export const useOutsideClick = ({ onOutsideClick }) => {
  const ref = useRef(null)

  useEffect(() => {
    const handleListener = (event) => {
      if (ref?.current && ref.current.contains(event.target)) {
        return
      }

      onOutsideClick(event)
    }

    document.addEventListener('mousedown', handleListener)
    document.addEventListener('touchstart', handleListener)

    return () => {
      document.removeEventListener('mousedown', handleListener)
      document.removeEventListener('touchstart', handleListener)
    }
  }, [])

  return ref
}
