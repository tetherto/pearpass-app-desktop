import { useState, useCallback, useEffect, useRef } from 'react'

import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { useVault, useVaults } from '@tetherto/pearpass-lib-vault'
import { pearpassVaultClient } from '@tetherto/pearpass-lib-vault/src/instances'
import { html } from 'htm/react'

import { appConfig } from './appConfig'
import { useInactivity } from './hooks/useInactivity'
import { useOnExtensionExit } from './hooks/useOnExtensionExit'
import { useOnExtensionLockOut } from './hooks/useOnExtensionLockOut'
import { useRedirect } from './hooks/useRedirect'
import { ContentFrame, WindowBackground } from './styles'
import { TitleBar } from '../../components/TitleBar'
import { AppHeaderContainer } from '../../containers/AppHeaderContainer'
import { useRouter } from '../../context/RouterContext'
import { usePearUpdate } from '../../hooks/usePearUpdate'
import { useVaultAccessRevoked } from '../../hooks/useVaultAccessRevoked'
import { useVaultSwitch } from '../../hooks/useVaultSwitch'
import { Routes } from '../Routes'

export const App = () => {
  const { theme } = useTheme()
  const { currentPage, navigate } = useRouter()
  usePearUpdate()
  const [isLoadingPageComplete, setIsLoadingPageComplete] = useState(false)

  useInactivity()
  const { isLoading: isDataLoading } = useRedirect()

  useOnExtensionExit()
  useOnExtensionLockOut()

  useVaultAccessRevoked()
  const { data: vaultsForDevTrigger, refetch: refetchVaults } = useVaults()
  const { data: activeVault } = useVault()
  const { switchVault } = useVaultSwitch()

  // Stable refs so the master-update subscription below stays attached for the
  // lifetime of the App without re-running on every render.
  const refetchVaultsRef = useRef(refetchVaults)
  useEffect(() => {
    refetchVaultsRef.current = refetchVaults
  }, [refetchVaults])

  useEffect(() => {
    // Refresh the vault list when the master vault mutates from another
    // process (e.g. extension deletes a vault). Local mutations already update
    // redux via their thunk reducers.
    if (!pearpassVaultClient?.on) return
    const handler = () => {
      void refetchVaultsRef.current()
    }
    pearpassVaultClient.on('master-update', handler)
    return () => {
      pearpassVaultClient.off?.('master-update', handler)
    }
  }, [])

  useEffect(() => {
    // If the active vault disappears from the master list (e.g. another
    // process deleted it), switch to the first remaining vault. When none
    // remain, fall through to the v2 vault view; the delete handler that
    // initiated the removal will auto-create a fresh "Personal" vault.
    // Routing to v1 welcome+VAULTS here caused a CardVaultSelect flash
    // during local deletes because master-update refetches vaultsSlice to
    // [] before deleteVaultLocal.fulfilled clears vaultSlice.data.
    if (!activeVault?.id || !vaultsForDevTrigger) return
    if (vaultsForDevTrigger.some((v) => v.id === activeVault.id)) return
    const next = vaultsForDevTrigger[0]
    if (next) {
      void switchVault(next)
    } else {
      navigate('vault', { recordType: 'all' })
    }
  }, [activeVault?.id, vaultsForDevTrigger, switchVault, navigate])

  const handleLoadingComplete = useCallback(() => {
    setIsLoadingPageComplete(true)
  }, [])

  const showLoadingPage = isDataLoading || !isLoadingPageComplete

  const useLogoTitleBar = appConfig.headerWithLogo.includes(currentPage)
  return html`
    <${WindowBackground} $backgroundColor=${theme.colors.colorBackground}>
      ${useLogoTitleBar
        ? html`<${TitleBar} />`
        : html`<${AppHeaderContainer} />`}
      <${ContentFrame}
        $backgroundColor=${theme.colors.colorBackground}
        $borderColor=${theme.colors.colorBorderPrimary}
      >
        <${Routes}
          isSplashScreenShown=${false}
          isDataLoading=${showLoadingPage}
          onLoadingComplete=${handleLoadingComplete}
        />
      <//>
    <//>
  `
}
