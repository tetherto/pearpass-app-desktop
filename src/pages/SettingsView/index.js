import { useState } from 'react'

import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { AboutContent } from './AboutContent'
import { AppearanceContent } from './AppearanceContent'
import { SecurityContent } from './SecurityContent'
import {
  NavBar,
  NavItems,
  SettingsContentArea,
  SettingsContentInner,
  SettingsNavItem,
  SettingsSidebar,
  Wrapper
} from './styles'
import { SyncingContent } from './SyncingContent'
import { VaultContent } from './VaultContent'
import { useRouter } from '../../context/RouterContext'
import { useTranslation } from '../../hooks/useTranslation'
import {
  AboutIcon,
  AppearanceIcon,
  BackIcon,
  ButtonRoundIcon,
  SecurityIcon,
  SyncingIcon,
  VaultIcon
} from '../../lib-react-components'

const NAV_ITEMS = [
  { key: 'security', label: 'Security', icon: SecurityIcon },
  { key: 'syncing', label: 'Syncing', icon: SyncingIcon },
  { key: 'vault', label: 'Vault', icon: VaultIcon },
  { key: 'appearance', label: 'Appearance', icon: AppearanceIcon },
  { key: 'about', label: 'About', icon: AboutIcon }
]

const renderActiveContent = (activeTab) => {
  switch (activeTab) {
    case 'security':
      return html`<${SecurityContent} />`
    case 'syncing':
      return html`<${SyncingContent} />`
    case 'vault':
      return html`<${VaultContent} />`
    case 'appearance':
      return html`<${AppearanceContent} />`
    case 'about':
      return html`<${AboutContent} />`
    default:
      return null
  }
}

export const SettingsView = () => {
  const { t } = useTranslation()
  const { navigate } = useRouter()

  const handleGoBack = () => {
    navigate('vault', { recordType: 'all' })
  }

  const [activeTab, setActiveTab] = useState('security')

  return html`
    <${Wrapper}>
      <${SettingsSidebar}>
        <${NavBar}>
          <${ButtonRoundIcon} onClick=${handleGoBack} startIcon=${BackIcon} />
          ${t('Settings')}
        <//>

        <${NavItems}>
          ${NAV_ITEMS.map(
            (item) => html`
              <${SettingsNavItem}
                key=${item.key}
                isActive=${activeTab === item.key}
                onClick=${() => setActiveTab(item.key)}
              >
                <${item.icon}
                  size="20"
                  color=${activeTab === item.key
                    ? colors.primary400.mode1
                    : undefined}
                />
                ${t(item.label)}
              <//>
            `
          )}
        <//>
      <//>

      <${SettingsContentArea}>
        <${SettingsContentInner}> ${renderActiveContent(activeTab)} <//>
      <//>
    <//>
  `
}
