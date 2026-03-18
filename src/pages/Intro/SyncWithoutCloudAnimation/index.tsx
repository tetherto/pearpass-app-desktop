import React, { useMemo } from 'react'
import { Alignment, Fit, Layout, RuntimeLoader } from '@rive-app/canvas'
import { useRiveWithRetry } from '../../../hooks/useRiveWithRetry'

RuntimeLoader.setWasmUrl('assets/rive/rive.wasm')

export const SyncWithoutCloudAnimation = (): React.ReactElement => {
  const riveParams = useMemo(
    () => ({
      src: 'assets/animations/sync_without_the_cloud_animation.riv',
      stateMachines: ['State Machine 1'],
      animations: ['Timeline 19'],
      layout: new Layout({
        fit: Fit.FitHeight,
        alignment: Alignment.Center
      }),
      autoplay: true
    }),
    []
  )

  const { RiveComponent, key } = useRiveWithRetry({
    riveParams,
    riveOptions: undefined
  })

  return <RiveComponent key={key} style={{ width: '100%', height: '100%' }} />
}
