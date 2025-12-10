import { RuntimeLoader } from '@rive-app/canvas'
import { useRive } from '@rive-app/react-canvas'
import { html } from 'htm/react'

RuntimeLoader.setWasmUrl('assets/rive/rive.wasm')

export const PasswordFillAnimation = () => {
  const { RiveComponent } = useRive({
    src: 'assets/animations/pearpass_password.riv',
    stateMachines: ['State Machine 1'],
    animations: ['Timeline 1', 'Timeline 2'],
    autoplay: true
  })

  return html`<${RiveComponent}
    style=${{ width: '100%', aspectRatio: '1 / 1' }}
  />`
}
