import os from 'os'

import { useEffect, useState } from 'react'
import type { ClipboardEvent } from 'react'

import { html } from 'htm/react'
import { generateQRCodeSVG } from 'pear-apps-utils-qr'
import { colors } from 'pearpass-lib-ui-theme-provider'
import {
  authoriseCurrentProtectedVault,
  useInvite,
  useVault,
  usePair
} from 'pearpass-lib-vault'
import { InputFieldWrapper } from './styles'
import { PasteIconWrapper } from './styles'
import {
  BackgroundSection,
  Content,
  CopyText,
  ExpireText,
  HeaderTitle,
  PairTabs,
  PairTab,
  QRCode,
  QRCodeCopy,
  QRCodeCopyWrapper,
  QRCodeSection,
  QRCodeText,
  LoadVaultNotice,
  PairingDescription
} from './styles'
import { AlertBox } from '../../../components/AlertBox'
import { FormModalHeaderWrapper } from '../../../components/FormModalHeaderWrapper'
import { useModal } from '../../../context/ModalContext'
import { useRouter } from '../../../context/RouterContext'
import { useToast } from '../../../context/ToastContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  CopyIcon,
  TimeIcon,
  UserSecurityIcon
} from '../../../lib-react-components'
import { InputField } from '../../../lib-react-components/components/InputField'
import { PasteIcon } from '../../../lib-react-components/icons/PasteIcon'
import { ModalContent } from '../ModalContent'
import { VaultPasswordFormModalContent } from '../VaultPasswordFormModalContent'
import { ScanQRExpireTimer } from './ScanQRExpireTimer'

export const AddDeviceModalContent = () => {
  const { t } = useTranslation()
  const { setToast } = useToast()
  const { closeModal } = useModal()
  const [qrSvg, setQrSvg] = useState('')
  const [isProtected, setIsProtected] = useState(true)
  const [scanQRStep, setScanQRStep] = useState(true)
  const {
    data: vaultData,
    isVaultProtected,
    refetch: refetchVault,
    addDevice
  } = useVault()
  const { createInvite, deleteInvite, data } = useInvite()
  const [inviteCode, setInviteCodeId] = useState('')
  const {
    pairActiveVault,
    isLoading: isPairing,
    cancelPairActiveVault
  } = usePair()
  const { navigate } = useRouter()

  const { copyToClipboard, isCopied } = useCopyToClipboard()

  useEffect(() => {
    createInvite()

    return () => {
      deleteInvite()
    }
  }, [])

  useEffect(() => {
    if (data?.publicKey) {
      generateQRCodeSVG(data?.publicKey, { type: 'svg', margin: 0 }).then(
        (value: string) => setQrSvg(value)
      )
    }
  }, [data])

  useEffect(() => {
    const checkProtection = async () => {
      const result = await isVaultProtected(vaultData?.id)
      setIsProtected(result)
    }
    checkProtection()
  }, [vaultData?.id])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPairing) {
        cancelPairActiveVault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [cancelPairActiveVault, isPairing])

  if (isProtected) {
    return html`<${VaultPasswordFormModalContent}
      onSubmit=${async (password: string) => {
        if (await authoriseCurrentProtectedVault(password)) {
          setIsProtected(false)
        }
      }}
      vault=${vaultData}
    />`
  }

  const handleLoadVault = async (code: string) => {
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
      closeModal()
    } catch {
      setInviteCodeId('')
      setToast({ message: t('Something went wrong, please check invite code') })
    }
  }

  const handleChange = (value: string) => {
    if (isPairing) {
      return
    }

    setInviteCodeId(value)
  }

  const processPastedText = (pastedText: string) => {
    if (pastedText) {
      setInviteCodeId(pastedText)
      setTimeout(() => {
        if (!isPairing) {
          handleLoadVault(pastedText)
        }
      }, 0)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData?.getData('text')
    processPastedText(pastedText)
  }

  const handlePasteClick = async () => {
    try {
      const pastedText = await navigator.clipboard.readText()
      processPastedText(pastedText)
    } catch {
      setToast({
        message: t('Failed to paste from clipboard'),
      })
    }
  }

  return html`
    <${ModalContent}
      onClose=${closeModal}
      headerChildren=${html`
        <${FormModalHeaderWrapper}>
          <${HeaderTitle}>
            <${UserSecurityIcon} />

            ${t('Add a device')}
          <//>
        <//>
      `}
    >
      <${Content}>
        <${PairingDescription}>
          ${t(
            scanQRStep
              ? 'Scan this QR code or paste the vault key into the PearPass app on your other device to connect it to your account. This method keeps your account secure.'
              : 'Paste the vault key from the PearPass app on your other device to connect it to your account. This method keeps your account secure.'
          )}
        <//>
        <${PairTabs}>
          <${PairTab}
            type="button"
            $active=${scanQRStep}
            onClick=${() => setScanQRStep(true)}
          >
            ${t('Share this vault')}
          <//>
          <${PairTab}
            type="button"
            $active=${!scanQRStep}
            onClick=${() => setScanQRStep(false)}
          >
            ${t('Load a vault')}
          <//>
        <//>
        ${scanQRStep
          ? html`
              <${QRCodeSection}>
                <${QRCodeText}> ${t('Scan this QR code')} <//>

                <${QRCode}
                  style=${{ width: '200px', height: '200px' }}
                  dangerouslySetInnerHTML=${{ __html: qrSvg }}
                />
              <//>

              <${BackgroundSection}>
                <${ExpireText}>
                  ${t('This link will expire in')}
                  <${ScanQRExpireTimer} />
                <//>

                <${TimeIcon} color=${colors.primary400.mode1} />
              <//>

              <${BackgroundSection}
                onClick=${() => {
                  if (data?.publicKey) {
                    copyToClipboard(data.publicKey)
                  } else {
                    setToast({
                      message: t('Invite code not found')
                    })
                  }
                }}
              >
                <${QRCodeCopyWrapper}>
                  <${QRCodeCopy}>
                    <${QRCodeText}>
                      ${t('Copy this vault key to your device')}
                    <//>
                    <${CopyIcon} color=${colors.primary400.mode1} />
                  <//>
                  <${CopyText}>
                    ${isCopied ? t('Copied!') : data?.publicKey || ''}
                  <//>
                <//>
              <//>

              <${AlertBox}
                message=${t(
                  'Caution: You’re generating a secure invitation to sync another device with your vault. Treat this invite with the same confidentiality as your password.'
                )}
              />
            `
          : html`
              <${InputFieldWrapper}>
                <${InputField}
                  testId="add-device-input-code"
                  label=${t('Vault key')}
                  placeholder=${t('Insert vault key...')}
                  variant="outline"
                  onChange=${handleChange}
                  value=${inviteCode}
                  onPaste=${handlePaste}
                  additionalItems=${html`<${PasteIconWrapper}
                    onClick=${handlePasteClick}
                  >
                    <${PasteIcon} color=${colors.primary400.mode1} size="16" />
                    ${t('Paste')}
                  <//>`}
                />
              <//>
              ${isPairing &&
              html`
                <${LoadVaultNotice}> ${t('Click Escape to cancel pairing')} <//>
              `}
            `}
      <//>
    <//>
  `
}
