import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'

import { ContentWrapper, LayoutWrapper, SideBarWrapper } from './styles'
import { Sidebar } from '../Sidebar/Sidebar'

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

  const sideViewStyle = {
    flexBasis: 0,
    flexShrink: isSideViewOpen ? 0 : 1,
    flexGrow: isSideViewOpen ? 1 : 0,
    minWidth: isSideViewOpen ? '250px' : 0,
    overflowX: 'hidden',
    overflowY: isSideViewOpen ? 'auto' : 'hidden',
    backgroundColor: theme.colors.colorSurfacePrimary,
    borderLeftWidth: isSideViewOpen ? 1 : 0,
    borderLeftStyle: 'solid',
    borderLeftColor: theme.colors.colorBorderPrimary,
    transition:
      'flex-grow 150ms ease, border-left-width 150ms ease, min-width 150ms ease'
  }

  const mainViewStyle = isSideViewOpen
    ? {
        flex: '0 1 350px',
        minWidth: '300px',
        transition: 'flex 150ms ease'
      }
    : {}

  return html`
    <${LayoutWrapper}>
      <${SideBarWrapper}>
        <${Sidebar} />
      <//>

      <${ContentWrapper} style=${mainViewStyle}> ${mainView} <//>

      ${sideView && html`<div style=${sideViewStyle}>${sideView}</div>`}
    <//>
  `
}
