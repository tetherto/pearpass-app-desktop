import { html } from 'htm/react'

import { LayoutWithSidebar } from '../../containers/LayoutWithSidebar'
import { RecordDetails } from '../../containers/RecordDetails'
import { useRouter } from '../../context/RouterContext'
import { InitialPage } from '../../pages/InitialPage'
import { Intro } from '../../pages/Intro'
import { MainView } from '../../pages/MainView'
import { SettingsView } from '../../pages/SettingsView'
import { WelcomePage } from '../../pages/WelcomePage'

/**
 * @param {Object} props
 * @param {boolean} props.isLoading
 * @returns {import('react').ReactNode}
 */
export const Routes = ({ isLoading }) => {
  const { currentPage, data } = useRouter()

  if (isLoading || currentPage === 'loading') {
    return html` <${InitialPage} /> `
  }

  if (currentPage === 'intro') {
    return html` <${Intro} /> `
  }

  if (currentPage === 'welcome') {
    return html` <${WelcomePage} /> `
  }

  if (currentPage === 'settings') {
    return html` <${SettingsView} /> `
  }

  if (currentPage === 'vault') {
    return html`
      <${LayoutWithSidebar}
        mainView=${html`<${MainView} />`}
        sideView=${getSideView(currentPage, data)}
      />
    `
  }
}

/**
 * @param {string} currentPage
 * @param {import('../../context/RouterContext').RouterData} data
 * @returns {import('react').ReactNode}
 */
function getSideView(currentPage, data) {
  if (currentPage === 'vault' && data?.recordId) {
    return html` <${RecordDetails} /> `
  }
}
