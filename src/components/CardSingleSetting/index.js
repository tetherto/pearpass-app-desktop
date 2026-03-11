import { html } from 'htm/react'

import { Container, Description, Header, Title } from './styles'

/**
 * @param {{
 *  title: string
 *  description?: string
 *  additionalHeaderContent?: import('react').ReactNode
 *  children: import('react').ReactNode
 * }} props
 */
export const CardSingleSetting = ({
  title,
  description,
  children,
  additionalHeaderContent,
  testId
}) => html`
  <${Container} data-testid=${testId}>
    <${Header}>
      <${Title}>${title}<//>
      ${additionalHeaderContent && additionalHeaderContent}
    <//>
    ${description && html` <${Description}>${description}<//> `}
    <div>${children}<//>
  <//>
`
