import QRCode from 'qrcode'

/**
 * @param {string} text
 * @param {{type: 'svg', margin: number}} config
 * @returns {Promise<string>}
 */
export const generateQRCodeSVG = (text, config) => QRCode.toString(text, config)
