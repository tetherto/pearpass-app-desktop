import { html } from 'htm/react'

import { LayoutWithSidebar } from '../../containers/LayoutWithSidebar'
import { RecordDetails } from '../../containers/RecordDetails'
import { useRouter } from '../../context/RouterContext'
import { InitialPage } from '../../pages/InitialPage'
import { Intro } from '../../pages/Intro'
import { LoadingPage } from '../../pages/LoadingPage'
import { MainView } from '../../pages/MainView'
import { SettingsView } from '../../pages/SettingsView'
import { WelcomePage } from '../../pages/WelcomePage'

/**
 * @param {Object} props
 * @param {boolean} props.isSplashScreenShown - Shows InitialPage (splash screen)
 * @param {boolean} props.isDataLoading - Shows LoadingPage (with progress bar)
 * @param {() => void} [props.onLoadingComplete] - Callback when LoadingPage finishes
 * @returns {import('react').ReactNode}
 */
export const Routes = ({
  isSplashScreenShown,
  isDataLoading,
  onLoadingComplete
}) => {
  const { currentPage, data } = useRouter()

  // Show InitialPage during initial splash
  if (isSplashScreenShown) {
    return html` <${InitialPage} /> `
  }

  // Show LoadingPage with progress bar during data loading
  if (isDataLoading || currentPage === 'loading') {
    return html` <${LoadingPage} onLoadingComplete=${onLoadingComplete} /> `
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
