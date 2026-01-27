import { useRive } from '@rive-app/react-canvas'
import { UseRiveParameters, UseRiveOptions, RiveState } from '@rive-app/react-canvas'
import { useState, useCallback, useMemo } from 'react'

const MAX_RETRIES = 20
const RETRY_DELAY_MS = 1000

type UseRiveWithRetryReturn = RiveState & {
  key: string
}

export const useRiveWithRetry = (params: {
  riveParams: UseRiveParameters
  riveOptions?: Partial<UseRiveOptions>
}): UseRiveWithRetryReturn => {
  const { riveParams, riveOptions } = params
  const [retryCount, setRetryCount] = useState(0)

  const handleLoadError = useCallback(
    (_err: unknown): void => {

      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
        }, RETRY_DELAY_MS)
      }
    },
    [retryCount]
  )

  const modifiedParams = useMemo((): UseRiveParameters => {
    if (!riveParams) return null

    return {
      ...riveParams,
      onLoadError: handleLoadError,
    }
  }, [riveParams, handleLoadError])

  const riveState = useRive(modifiedParams, riveOptions)

  const key = useMemo((): string => `retry-rive-${retryCount}`, [retryCount])

  return { ...riveState, key }
}
