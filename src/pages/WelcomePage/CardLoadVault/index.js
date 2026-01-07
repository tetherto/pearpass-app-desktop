import os from 'os'

import { useEffect, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { usePair, useVault } from 'pearpass-lib-vault'

import {
  Header,
  InputContainer,
  LoadVaultCard,
  LoadVaultInput,
  LoadVaultNotice,
  LoadVaultTitle
} from './styles'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useRouter } from '../../../context/RouterContext'
import { useToast } from '../../../context/ToastContext'
import { ArrowLeftIcon, ButtonRoundIcon } from '../../../lib-react-components'

export const CardLoadVault = () => {
  const { i18n } = useLingui()
  const { navigate } = useRouter()

  const [inviteCode, setInviteCodeId] = useState('')

  const { setToast } = useToast()

  const { refetch: refetchVault, addDevice } = useVault()

  const {
    pairActiveVault,
    cancelPairActiveVault,
    isLoading: isPairing
  } = usePair()

  const handleChange = (e) => {
    if (isPairing) {
      return
    }

    setInviteCodeId(e.target.value)
  }

  const handleLoadVault = async (code) => {
    try {
      const vaultId = await pairActiveVault(code)

      if (!vaultId) {
        throw new Error('Vault ID is empty')
      }

      await refetchVault(vaultId)

      await addDevice(os.hostname() + ' ' + os.platform() + ' ' + os.release())

      navigate('vault', {
        recordType: 'all'
      })
    } catch {
      setInviteCodeId('')
      setToast({
        message: i18n._('Something went wrong, please check invite code')
      })
    }
  }

  const handleGoBack = () => {
    navigate('welcome', { state: NAVIGATION_ROUTES.VAULTS })
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        cancelPairActiveVault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cancelPairActiveVault])

  return html` <${LoadVaultCard} isLoading=${isPairing}>
    <${Header}>
      <${ButtonRoundIcon}
        onClick=${handleGoBack}
        variant="secondary"
        startIcon=${ArrowLeftIcon}
      />
      <${LoadVaultTitle}>${i18n._('Load an existing Vault')}<//>
    <//>

    <${InputContainer}>
      <${LoadVaultInput}
        autoFocus
        placeholder=${i18n._('Insert your code vault...')}
        value=${inviteCode}
        onChange=${handleChange}
        onPaste=${(e) => {
          const pastedText = e.clipboardData?.getData('text')
          if (pastedText) {
            setInviteCodeId(pastedText)
            setTimeout(() => {
              if (!isPairing) {
                handleLoadVault(pastedText)
              }
            }, 0)
          }
        }}
        onKeyPress=${(e) => {
          if (e.key === 'Enter' && !isPairing) {
            handleLoadVault(inviteCode)
          }
        }}
      />

      ${isPairing &&
      html`<${LoadVaultNotice}>${i18n._('Click Escape to cancel pairing')}<//>`}
    <//>
  <//>`
}
