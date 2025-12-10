/** @typedef {import('pear-interface')} */ /* global Pear */

import { createElement } from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import htm from 'htm'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'
import { setPearpassVaultClient, VaultProvider } from 'pearpass-lib-vault'
import { createRoot } from 'react-dom/client'

import { App } from './src/app/App'
import { LoadingProvider } from './src/context/LoadingContext'
import { ModalProvider } from './src/context/ModalContext'
import { RouterProvider } from './src/context/RouterContext'
import { ToastProvider } from './src/context/ToastContext'
import { messages } from './src/locales/en/messages.mjs'
import { createOrGetPearpassClient } from './src/services/createOrGetPearpassClient'
import { createOrGetPipe } from './src/services/createOrGetPipe'
import { startNativeMessagingIPC } from './src/services/nativeMessagingIPCServer'
import { logger } from './src/utils/logger'
import { setFontsAndResetCSS } from './styles'

const storage = Pear.config.storage

// Set fonts and reset CSS
setFontsAndResetCSS()

// Initialize i18n
i18n.load('en', messages)
i18n.activate('en')

// Initialize the vault client
const pipe = createOrGetPipe()

// const isProduction =
//   (typeof Pear !== 'undefined' && !!Pear.config?.key) ||
//   (typeof process !== 'undefined' &&
//     process.env &&
//     process.env.NODE_ENV === 'production')

const client = createOrGetPearpassClient(pipe, storage, {
  debugMode: false
})

setPearpassVaultClient(client)

// Check if native messaging is enabled and start IPC server
// For testing, always start the IPC server
startNativeMessagingIPC(client).catch((err) => {
  logger.error('INDEX', 'Failed to start IPC server:', err)
})

let inactivityTimeout

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimeout)

  inactivityTimeout = setTimeout(() => {
    window.dispatchEvent(new Event('user-inactive'))
  }, 60 * 1000)
}

const activityEvents = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll'
]

activityEvents.forEach((event) =>
  window.addEventListener(event, resetInactivityTimer)
)

resetInactivityTimer()

// Render the application
const root = createRoot(document.querySelector('#root'))
const html = htm.bind(createElement)
root.render(html`
  <${LoadingProvider}>
    <${ThemeProvider}>
      <${VaultProvider}>
        <${I18nProvider} i18n=${i18n}>
          <${ToastProvider}>
            <${RouterProvider}>
              <${ModalProvider}>
                <${App} />
              <//>
            <//>
          <//>
        <//>
      <//>
    <//>
  <//>
`)
