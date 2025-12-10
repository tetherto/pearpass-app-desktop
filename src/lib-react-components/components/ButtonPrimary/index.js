import { html } from 'htm/react'

import { Button } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode,
 *  size?: 'sm' | 'md' | 'lg',
 *  onClick: () => void
 *  type?: 'button' | 'submit'
 * }} props
 */
export const ButtonPrimary = ({
  children,
  size = 'md',
  onClick,
  type = 'button'
}) => html`
  <${Button} size=${size} onClick=${onClick} type=${type}> ${children} <//>
`
