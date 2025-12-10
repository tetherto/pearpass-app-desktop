import { useEffect, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { generateQRCodeSVG } from 'pear-apps-utils-qr'

import { Container, QRCode, QrContainer, Title } from './styles'
import { logger } from '../../utils/logger'

/**
 * @param {{
 *   ssid: string
 *   password: string
 *   encryptionType?: string
 *   isHidden?: boolean
 * }} props
 */
export const WifiPasswordQRCode = ({
  ssid,
  password,
  encryptionType = 'WPA',
  isHidden = false
}) => {
  const { i18n } = useLingui()

  const [qrCodeSvg, setQrCodeSvg] = useState('')

  const generateWifiQRString = (
    ssid,
    password,
    encryptionType = 'WPA',
    isHidden = false
  ) => `WIFI:T:${encryptionType};S:${ssid};P:${password};H:${isHidden};;`

  useEffect(() => {
    if (ssid && password) {
      const wifiString = generateWifiQRString(
        ssid,
        password,
        encryptionType,
        isHidden
      )

      generateQRCodeSVG(wifiString, { type: 'svg', margin: 0 })
        .then((svgString) => {
          setQrCodeSvg(svgString)
        })
        .catch((error) => {
          logger.error('Error generating QR code:', error)
        })
    }
  }, [ssid, password, encryptionType, isHidden])

  if (!ssid || !password || !qrCodeSvg) {
    return null
  }

  return html`
    <${Container}>
      <${Title}> ${i18n._(`Scan the QR-Code to connect to the Wi-Fi`)} <//>
      <${QrContainer}>
        <${QRCode}
          style=${{ width: '200px', height: '200px' }}
          dangerouslySetInnerHTML=${{ __html: qrCodeSvg }}
        />
      <//>
    <//>
  `
}
