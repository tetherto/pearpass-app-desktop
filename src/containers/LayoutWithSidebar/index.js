import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'

import {
  ContentWrapper,
  ContentWrapperV2,
  LayoutWrapper,
  SideBarWrapper,
  SideViewWrapper
} from './styles'
import { isV2 } from '../../utils/designVersion'
import { Sidebar } from '../Sidebar'
import { SidebarV2 } from '../Sidebar/SidebarV2'

/**
 * @typedef LayoutWithSidebarProps
 * @property {import('react').ReactNode} mainView
 * @property {import('react').ReactNode} sideView
 * @property {boolean} isSideViewOpen
 */

/**
 * @param {LayoutWithSidebarProps} props
 */

export const LayoutWithSidebar = ({ mainView, sideView, isSideViewOpen }) => {
  const { theme } = useTheme()
  const isV2Design = isV2()
  const VersionBasedContentWrapper = isV2Design
    ? ContentWrapperV2
    : ContentWrapper

  const v2SideViewStyle = {
    flexBasis: 0,
    flexShrink: 1,
    flexGrow: isSideViewOpen ? 1 : 0,
    minWidth: 0,
    overflowX: 'hidden',
    overflowY: isSideViewOpen ? 'auto' : 'hidden',
    backgroundColor: theme.colors.colorSurfacePrimary,
    borderLeftWidth: isSideViewOpen ? 1 : 0,
    borderLeftStyle: 'solid',
    borderLeftColor: theme.colors.colorBorderPrimary,
    transition: 'flex-grow 150ms ease, border-left-width 150ms ease'
  }

  return html`
    <${LayoutWrapper}>
      <${SideBarWrapper}>
        ${isV2Design ? html`<${SidebarV2} />` : html`<${Sidebar} />`}
      <//>

      <${VersionBasedContentWrapper}> ${mainView} <//>

      ${isV2Design
        ? sideView && html`<div style=${v2SideViewStyle}>${sideView}</div>`
        : isSideViewOpen && sideView
          ? html`<${SideViewWrapper}>${sideView}<//>`
          : null}
    <//>
  `
}
