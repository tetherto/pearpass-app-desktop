import { useEffect, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useCountDown } from 'pear-apps-lib-ui-react-hooks'
import { generateQRCodeSVG } from 'pear-apps-utils-qr'
import { colors } from 'pearpass-lib-ui-theme-provider'
import {
  authoriseCurrentProtectedVault,
  useInvite,
  useVault
} from 'pearpass-lib-vault'

import {
  BackgroundSection,
  Content,
  CopyText,
  ExpireText,
  ExpireTime,
  HeaderTitle,
  QRCode,
  QRCodeCopy,
  QRCodeCopyWrapper,
  QRCodeSection,
  QRCodeText
} from './styles'
import { AlertBox } from '../../../components/AlertBox'
import { FormModalHeaderWrapper } from '../../../components/FormModalHeaderWrapper'
import { useModal } from '../../../context/ModalContext'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import {
  CopyIcon,
  TimeIcon,
  UserSecurityIcon
} from '../../../lib-react-components'
import { ModalContent } from '../ModalContent'
import { VaultPasswordFormModalContent } from '../VaultPasswordFormModalContent'

export const AddDeviceModalContent = () => {
  const { i18n } = useLingui()
  const { closeModal } = useModal()
  const [qrSvg, setQrSvg] = useState('')
  const [isProtected, setIsProtected] = useState(true)
  const { data: vaultData, isVaultProtected } = useVault()
  const { createInvite, deleteInvite, data } = useInvite()

  const expireTime = useCountDown({
    initialSeconds: 120,
    onFinish: closeModal
  })

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
        (value) => setQrSvg(value)
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

  if (isProtected) {
    return html`<${VaultPasswordFormModalContent}
      onSubmit=${async (password) => {
        if (await authoriseCurrentProtectedVault(password)) {
          setIsProtected(false)
        }
      }}
      vault=${vaultData}
    />`
  }

  return html`
    <${ModalContent}
      onClose=${closeModal}
      headerChildren=${html`
        <${FormModalHeaderWrapper}>
          <${HeaderTitle}>
            <${UserSecurityIcon} />

            ${i18n._('Add a device')}
          <//>
        <//>
      `}
    >
      <${Content}>
        <${QRCodeSection}>
          <${QRCodeText}> ${i18n._('Scan this QR code')} <//>

          <${QRCode}
            style=${{ width: '200px', height: '200px' }}
            dangerouslySetInnerHTML=${{ __html: qrSvg }}
          />
        <//>

        <${BackgroundSection}>
          <${ExpireText}>
            ${i18n._('This link will expire in')}
            <${ExpireTime}> ${expireTime} <//>
          <//>

          <${TimeIcon} color=${colors.primary400.mode1} />
        <//>

        <${BackgroundSection} onClick=${() => copyToClipboard(data?.publicKey)}>
          <${QRCodeCopyWrapper}>
            <${QRCodeCopy}>
              <${QRCodeText}> ${i18n._('Copy account link')} <//>
              <${CopyIcon} color=${colors.primary400.mode1} />
            <//>
            <${CopyText}> ${isCopied ? i18n._('Copied!') : data?.publicKey} <//>
          <//>
        <//>

        <${AlertBox}
          message=${i18n._(
            'Caution: You’re generating a secure invitation to sync another device with your vault. Treat this invite with the same confidentiality as your password.'
          )}
        />
      <//>
    <//>
  `
}
