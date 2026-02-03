import { html } from 'htm/react'

import { CardSingleSetting } from '../../../components/CardSingleSetting'
import { useConnectExtension } from '../../../hooks/useConnectExtension'
import { useTranslation } from '../../../hooks/useTranslation'
import { Switch } from '../../../lib-react-components'
import { SettingsBlindPeersSection } from '../SettingsAdvancedTab/SettingsBlindPeersSection'
import { SwitchWrapper } from '../SettingsAdvancedTab/styles'

export const SyncingContent = () => {
  const { t } = useTranslation()

  const { isBrowserExtensionEnabled, toggleBrowserExtension } =
    useConnectExtension()

  return html`
    <${SettingsBlindPeersSection} />

    <${CardSingleSetting}
      title=${t('Browser Extension')}
      description=${t('Manage the browsers paired with your account.')}
    >
      <${SwitchWrapper}>
        <${Switch}
          isOn=${isBrowserExtensionEnabled}
          onChange=${(isOn) => toggleBrowserExtension(isOn)}
        ><//>
        ${t('Activate browser extension')}
      <//>
    <//>
  `
}
