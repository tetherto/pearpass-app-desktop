import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import { OtpRefreshProvider } from '@tetherto/pearpass-lib-vault'
import { html } from 'htm/react'

import { LayoutWithSidebar } from '../../containers/LayoutWithSidebar'
import { RecordDetails } from '../../containers/RecordDetails'
import { useRouter } from '../../context/RouterContext'
import { AuthenticatorView } from '../../pages/AuthenticatorView'
import { InitialPage } from '../../pages/InitialPage'
import { Intro } from '../../pages/Intro'
import { IntroV2 } from '../../pages/Intro/IntroV2'
import { LoadingPage } from '../../pages/LoadingPage'
import { LoadingPageV2 } from '../../pages/LoadingPage/LoadingPageV2'
import { MainView } from '../../pages/MainView'
import { SettingsView } from '../../pages/SettingsView'
import { WelcomePage } from '../../pages/WelcomePage'
import { isV2 } from '../../utils/designVersion'

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
    if (isV2()) {
      return html` <${LoadingPageV2} progress=${0} /> `
    }
    return html` <${InitialPage} /> `
  }

  // Show LoadingPage with progress bar during data loading
  if (isDataLoading || currentPage === 'loading') {
    return html` <${LoadingPage} onLoadingComplete=${onLoadingComplete} /> `
  }

  if (currentPage === 'intro') {
    if (isV2()) {
      return html` <${IntroV2} /> `
    }
    return html` <${Intro} /> `
  }

  if (currentPage === 'welcome') {
    return html` <${WelcomePage} /> `
  }

  if (currentPage === 'settings') {
    return html` <${SettingsView} /> `
  }

  if (currentPage === 'vault') {
    const isAuthenticator =
      AUTHENTICATOR_ENABLED && data?.recordType === 'authenticator'

    return html`
      <${OtpRefreshProvider}>
        <${LayoutWithSidebar}
          mainView=${isAuthenticator
            ? html`<${AuthenticatorView} />`
            : html`<${MainView} />`}
          sideView=${getSideView(currentPage, data)}
        />
      <//>
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
