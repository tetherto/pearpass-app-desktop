import os from 'os'

import { useEffect, useState } from 'react'

import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { usePair, useVault } from 'pearpass-lib-vault'

import {
  Header,
  InputContainer,
  LoadVaultCard,
  LoadVaultInput,
  LoadVaultNotice,
  LoadVaultTitle,
  LoadVaultDescription,
  ImportVaultButtonContent,
  IconWrapper,
  ImportVaultButtonWrapper
} from './styles'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useRouter } from '../../../context/RouterContext'
import { useToast } from '../../../context/ToastContext'
import { usePasteFromClipboard } from '../../../hooks/usePasteFromClipboard'
import { useTranslation } from '../../../hooks/useTranslation'
import { ButtonPrimary } from '../../../lib-react-components'
import {
  ArrowLeftIcon,
  ButtonRoundIcon,
  LockCircleIcon
} from '../../../lib-react-components'

export const CardLoadVault = () => {
  const { t } = useTranslation()
  const { navigate } = useRouter()
  const { pasteFromClipboard } = usePasteFromClipboard()
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
        message: t('Something went wrong, please check invite code')
      })
    }
  }

  const handleGoBack = () => {
    navigate('welcome', { state: NAVIGATION_ROUTES.VAULTS })
  }

  const handlePastedText = (pastedText) => {
    if (pastedText) {
      setInviteCodeId(pastedText)
      setTimeout(() => {
        if (!isPairing) {
          handleLoadVault(pastedText)
        }
      }, 0)
    }
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
      <${LoadVaultTitle}>${t('Import an existing vault')}<//>
    <//>
    <${LoadVaultDescription}
      >${t(
        'Using PearPass on your other device, use "Add Device" to generate a QR or connection code to pair your account. This method keeps your account secure.'
      )}<//
    >
    <${InputContainer}>
      <${LoadVaultInput}
        autoFocus
        placeholder=${t('Enter your vault code…')}
        value=${inviteCode}
        onChange=${handleChange}
        onPaste=${(e) => {
          const pastedText = e.clipboardData?.getData('text')
          handlePastedText(pastedText)
        }}
        onKeyPress=${(e) => {
          if (e.key === 'Enter' && !isPairing) {
            handleLoadVault(inviteCode)
          }
        }}
      />

      ${isPairing &&
      html`<${LoadVaultNotice}>${t('Click Escape to cancel pairing')}<//>`}
    <//>
    <${ImportVaultButtonWrapper}>
      <${ButtonPrimary}
        type="button"
        onClick=${async () => {
          const pastedText = await pasteFromClipboard()
          handlePastedText(pastedText)
        }}
        width="260px"
      >
        <${ImportVaultButtonContent}>
          <${IconWrapper}>
            <${LockCircleIcon} size="24" color=${colors.black.mode1} />
          <//>
          ${t('Import vault')}
        <//>
      <//>
    <//>
  <//>`
}
