import { html } from 'htm/react'

import {
  ContentWrapper,
  LayoutWrapper,
  SideBarWrapper,
  SideViewWrapper
} from './styles'
import { Sidebar } from '../Sidebar'

/**
 * @typedef LayoutWithSidebarProps
 * @property {import('react').ReactNode} mainView
 * @property {import('react').ReactNode} sideView
 */

/**
 * @param {LayoutWithSidebarProps} props
 */

export const LayoutWithSidebar = ({ mainView, sideView }) => html`
  <${LayoutWrapper}>
    <${SideBarWrapper}>
      <${Sidebar} />
    <//>

    <${ContentWrapper}> ${mainView} <//>

    ${sideView && html` <${SideViewWrapper}> ${sideView} <//>`}
  <//>
`
