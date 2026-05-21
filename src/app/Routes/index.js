import { AUTHENTICATOR_ENABLED } from '@tetherto/pearpass-lib-constants'
import { OtpRefreshProvider, RECORD_TYPES } from '@tetherto/pearpass-lib-vault'
import { html } from 'htm/react'

import { LayoutWithSidebar } from '../../containers/LayoutWithSidebar'
import { RecordDetails } from '../../containers/RecordDetails/RecordDetails'
import { useRouter } from '../../context/RouterContext'
import { AuthenticatorView } from '../../pages/AuthenticatorView'
import { Intro } from '../../pages/Intro/Intro'
import { LoadingPage } from '../../pages/LoadingPage/LoadingPage'
import { MainView } from '../../pages/MainView/MainView'
import { SettingsView } from '../../pages/SettingsView/SettingsView'
import { WelcomePage } from '../../pages/WelcomePage'

/**
 * @param {Object} props
 * @param {boolean} props.isSplashScreenShown - Shows LoadingPage at progress 0 (unused, kept for API compat)
 * @param {boolean} props.isDataLoading - Shows LoadingPage with progress bar
 * @param {() => void} [props.onLoadingComplete] - Callback when LoadingPage finishes
 * @returns {import('react').ReactNode}
 */
export const Routes = ({ isDataLoading, onLoadingComplete }) => {
  const { currentPage, data } = useRouter()

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
    return <SettingsView />
  }

  if (currentPage === 'vault') {
    const isAuthenticator =
      AUTHENTICATOR_ENABLED && data?.recordType === RECORD_TYPES.OTP

    return html`
      <${OtpRefreshProvider}>
        <${LayoutWithSidebar}
          mainView=${isAuthenticator
            ? html`<${AuthenticatorView} />`
            : html`<${MainView} />`}
          sideView=${html`<${RecordDetails} />`}
          isSideViewOpen=${!!data?.recordId}
        />
      <//>
    `
  }
}
