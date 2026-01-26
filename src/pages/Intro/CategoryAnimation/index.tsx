import React, { useMemo } from 'react'
import { RuntimeLoader } from '@rive-app/canvas'
import { useRiveWithRetry } from '../../../hooks/useRiveWithRetry'

RuntimeLoader.setWasmUrl('assets/rive/rive.wasm')

export const CategoryAnimation = (): React.ReactElement => {
  const riveParams = useMemo(() => ({
    src: 'assets/animations/category.riv',
    stateMachines: ['State Machine 1'],
    animations: ['Timeline 1'],
    autoplay: true
  }), [])

  const { RiveComponent, key } = useRiveWithRetry({ riveParams, riveOptions: undefined })

  return (
    <RiveComponent
      key={key}
      style={{ width: '100%', aspectRatio: '1 / 1' }}
    />
  )
}
