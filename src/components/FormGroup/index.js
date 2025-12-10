import { useState } from 'react'

import { html } from 'htm/react'

import { Collapse, TitleWrapper, Wrapper } from './styles'
import { ArrowDownIcon, ArrowUpIcon } from '../../lib-react-components'

/**
 * @param {{
 *  title: string,
 *  isCollapse: boolean
 *  defaultOpenState: boolean
 *  children: import('react').ReactNode
 * }} props
 */
export const FormGroup = ({
  title,
  isCollapse,
  children,
  defaultOpenState = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpenState)

  if (!children) {
    return
  }

  return html`
    <${Wrapper}>
      ${!!title?.length &&
      isCollapse &&
      html`
        <${TitleWrapper} onClick=${() => setIsOpen(!isOpen)}>
          <${isOpen ? ArrowUpIcon : ArrowDownIcon} />
          ${title}
        <//>
      `}
      ${isOpen && html` <${Collapse}> ${children} <//> `}
    <//>
  `
}
