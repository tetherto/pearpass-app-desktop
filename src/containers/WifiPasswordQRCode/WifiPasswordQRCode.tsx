import { useEffect, useState } from 'react'

import { generateQRCodeSVG } from '@tetherto/pear-apps-utils-qr'
import { rawTokens, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { useTranslation } from '../../hooks/useTranslation'
import { logger } from '../../utils/logger'

interface Props {
  ssid?: string
  password?: string
  encryptionType?: string
  isHidden?: boolean
}

export const WifiPasswordQRCode = ({
  ssid,
  password,
  encryptionType = 'WPA',
  isHidden = false
}: Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [qrCodeSvg, setQrCodeSvg] = useState('')

  useEffect(() => {
    if (!ssid || !password) {
      setQrCodeSvg('')
      return
    }
    const wifiString = `WIFI:T:${encryptionType};S:${ssid};P:${password};H:${isHidden};;`
    generateQRCodeSVG(wifiString, { type: 'svg', margin: 0 })
      .then((svg: string) => setQrCodeSvg(svg))
      .catch((err: unknown) => logger.error('Error generating QR code:', err))
  }, [ssid, password, encryptionType, isHidden])

  if (!ssid || !password || !qrCodeSvg) return null

  return (
    <div
      data-testid="wifidetails-qrcode"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: `${rawTokens.spacing20}px`,
        padding: `${rawTokens.spacing24}px ${rawTokens.spacing20}px`
      }}
    >
      <Text variant="label" color={theme.colors.colorTextSecondary}>
        {t('Scan QR Code to connect with the Wi-Fi')}
      </Text>
      <div
        style={{
          padding: `${rawTokens.spacing12}px`,
          borderRadius: `${rawTokens.radius8}px`,
          backgroundColor: theme.colors.colorSurfaceHover,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{ width: 188, height: 188 }}
          dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
        />
      </div>
    </div>
  )
}
