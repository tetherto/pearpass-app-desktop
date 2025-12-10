import { useState } from 'react'

import { html } from 'htm/react'
import { PRIVACY_POLICY, TERMS_OF_USE } from 'pearpass-lib-constants'

import { ExportTab } from './ExportTab'
import { ImportTab } from './ImportTab'
import { SettingsAdvancedTab } from './SettingsAdvancedTab'
import { SettingsTab } from './SettingsTab'
import { SettingsVaultsTab } from './SettingsVaultsTab'
import {
  ContentContainer,
  Link,
  NavBar,
  TabContainer,
  TabFooter,
  Tabs,
  TabTitle,
  Wrapper
} from './styles'
import { useRouter } from '../../context/RouterContext'
import { useTranslation } from '../../hooks/useTranslation'
import { BackIcon, ButtonRoundIcon } from '../../lib-react-components'

export const SettingsView = () => {
  const { t } = useTranslation()
  const { navigate } = useRouter()

  const handleGoBack = () => {
    navigate('vault', { recordType: 'all' })
  }

  const [activeTab, setActiveTab] = useState('general')

  const handleActiveTabChange = (tab) => {
    setActiveTab(tab)
  }

  return html`
    <${Wrapper}>
      <${NavBar}>
        <${ButtonRoundIcon} onClick=${handleGoBack} startIcon=${BackIcon} />

        ${t('Settings')}
      <//>

      <${ContentContainer}>
        <${Tabs}>
          <${TabTitle}
            onClick=${() => handleActiveTabChange('general')}
            isActive=${activeTab === 'general'}
          >
            ${t('General')}
          <//>

          <${TabTitle}
            onClick=${() => handleActiveTabChange('vaults')}
            isActive=${activeTab === 'vaults'}
          >
            ${t('Vaults')}
          <//>

          <${TabTitle}
            onClick=${() => handleActiveTabChange('import')}
            isActive=${activeTab === 'import'}
          >
            ${t('Import')}
          <//>

          <${TabTitle}
            onClick=${() => handleActiveTabChange('export')}
            isActive=${activeTab === 'export'}
          >
            ${t('Export')}
          <//>

          <${TabTitle}
            onClick=${() => handleActiveTabChange('privacy')}
            isActive=${activeTab === 'privacy'}
          >
            ${t('Advanced')}
          <//>
        <//>

        <${TabContainer}>
          ${renderActiveTab(activeTab)}
          <${TabFooter}>
            <${Link} href=${TERMS_OF_USE}> ${t('Terms of Use')} <//>
            <${Link} href=${PRIVACY_POLICY}> ${t('Privacy Statement')} <//>
          <//>
        <//>
      <//>
    <//>
  `
}

/**
 * @param {string} activeTab
 */
const renderActiveTab = (activeTab) => {
  switch (activeTab) {
    case 'general':
      return html`<${SettingsTab} />`
    case 'vaults':
      return html`<${SettingsVaultsTab} />`
    case 'import':
      return html`<${ImportTab} />`
    case 'export':
      return html`<${ExportTab} />`
    case 'privacy':
      return html`<${SettingsAdvancedTab} />`
    default:
      return null
  }
}
