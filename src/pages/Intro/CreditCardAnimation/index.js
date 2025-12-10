import { RuntimeLoader } from '@rive-app/canvas'
import { useRive } from '@rive-app/react-canvas'
import { html } from 'htm/react'

RuntimeLoader.setWasmUrl('assets/rive/rive.wasm')

export const CreditCardAnimation = () => {
  const { RiveComponent } = useRive({
    src: 'assets/animations/form_credit_card.riv',
    autoplay: true,
    animations: ['Timeline 1'],
    stateMachines: ['State Machine 1']
  })

  return html`<${RiveComponent}
    style=${{ width: '100%', aspectRatio: '1 / 1' }}
  />`
}
