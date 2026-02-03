import { html } from 'htm/react'

import { ExportTab } from '../ExportTab'
import { ImportTab } from '../ImportTab'
import { SettingsDevicesSection } from '../SettingsTab/SettingsDevicesSection'
import { SettingsVaultsTab } from '../SettingsVaultsTab'

export const VaultContent = () => html`
  <${SettingsVaultsTab} />
  <${SettingsDevicesSection} />
  <${ExportTab} />
  <${ImportTab} />
`
