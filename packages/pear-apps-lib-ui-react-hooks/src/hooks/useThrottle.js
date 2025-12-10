import { useState, useEffect, useRef } from 'react'

/**
 * Hook to throttle a value.
 * @property {{ value: any, interval: number }} params
 * @returns {{ throttledValue: any, throttle: (callback: () => void) => void }}
 */
export const useThrottle = ({ value, interval }) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastExecuted = useRef(0)

  const throttle = (callback) => {
    const now = Date.now()

    if (now - lastExecuted.current >= interval) {
      callback()
      lastExecuted.current = now
    } else {
      const timeout = setTimeout(
        () => {
          callback()
          lastExecuted.current = Date.now()
        },
        interval - (now - lastExecuted.current)
      )

      return () => clearTimeout(timeout)
    }
  }

  useEffect(() => {
    throttle(() => setThrottledValue(value))
  }, [value, interval])

  return { throttledValue, throttle }
}
