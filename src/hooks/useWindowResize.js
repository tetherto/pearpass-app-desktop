import { useState, useEffect } from 'react'

import { useThrottle } from 'pear-apps-lib-ui-react-hooks'

/**
 * Hook to get the window size with throttling.
 * @param {number} delay - The throttle delay in milliseconds.
 * @returns {{ width: number, height: number }} - The throttled window size.
 */
export const useWindowResize = (interval = 350) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const { throttle } = useThrottle({ value: windowSize, interval: interval })

  useEffect(() => {
    const handleResize = () => {
      throttle(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [throttle])

  return windowSize
}
