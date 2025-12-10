import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import {
  GreenText,
  PageContainer,
  PageContentContainer,
  PearHand,
  Title
} from './styles'
import { InitialPageWrapper } from '../../components/InitialPageWrapper'

/**
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to be rendered inside the page.
 * @returns {JSX.Element} The rendered initial page layout.
 */
export const BaseInitialPage = ({ children }) => {
  const { i18n } = useLingui()

  return html`
    <${InitialPageWrapper}>
      <${PageContainer}>
        <${PageContentContainer}>
          <div>
            <${Title}>
              ${i18n._('Protect')}${' '}

              <${GreenText}>${i18n._('your digital')}<//>
              ${' '} ${i18n._('life')}
            <//>
            ${children}
          </div>

          <${PearHand} src="assets/images/pear_lock_clear.png" alt="pearHand" />
        <//>
      <//>
    <//>
  `
}
