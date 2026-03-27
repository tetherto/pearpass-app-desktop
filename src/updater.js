import os from 'os'
import path from 'path'

import FramedStream from 'framed-stream'
import run from 'pear-run'
import {
  isLinux as IS_LINUX,
  isMac as IS_MAC,
  isWindows as IS_WINDOWS
} from 'which-runtime'

import { DEBUG_MODE } from './constants/appConstants'

export const PEAR_RUNTIME_UPDATED_MESSAGE = { type: 'pear-runtime/updated' }
export const PEAR_RUNTIME_UPDATING_MESSAGE = { type: 'pear-runtime/updating' }

function getApp() {
  try {
    const index = IS_WINDOWS ? process.argv.length - 2 : process.argv.length - 1

    const arg = process.argv[index]
    const { appling } = JSON.parse(arg).flags || {}
    if (!appling) return
    if (IS_MAC) {
      return path.join(appling, '..', '..', '..') // appling path points to the bin
    }
    return appling
  } catch {
    return
  }
}

async function startUpdater() {
  const pkg = (() => {
    try {
      if (typeof Pear?.get === 'function') {
        return Pear.get('package.json').then((txt) => JSON.parse(txt))
      }
    } catch {}
    // Fallback for dev environments.
    return fetch('package.json').then((res) => res.json())
  })()

  const { upgrade: upgradeFromPkg, version, productName } = await pkg
  const upgrade = upgradeFromPkg
  const app = getApp()

  const dir =
    Pear?.config?.storage ||
    (IS_MAC
      ? path.join(os.homedir(), 'Library', 'Application Support', 'PearPass')
      : IS_LINUX
        ? path.join(os.homedir(), '.config', 'PearPass')
        : path.join(os.homedir(), 'AppData', 'Roaming', 'PearPass'))

  const extension = IS_MAC ? '.app' : IS_LINUX ? '.AppImage' : '.msix'
  const name = productName + extension

  const args = [dir, upgrade, version, app, name]

  const link = Pear.key
    ? `${Pear.config.applink}/workers/updater/index.js`
    : path.join(Pear.config.dir, 'workers', 'updater', 'index.js')
  const pipe = new FramedStream(run(link, args))

  const events = {
    UPDATING: 'UPDATING',
    UPDATED: 'UPDATED'
  }

  pipe.on('data', (data) => {
    const text = Buffer.from(data).toString('utf8')
    const normalizedText = text.trim()
    // Worker logs are sent as JSON frames through the same pipe.
    if (DEBUG_MODE && normalizedText.startsWith('{')) {
      try {
        const msg = JSON.parse(normalizedText)
        if (msg?.type === 'OTA_LOG') {
          // eslint-disable-next-line no-console
          console.log('OTA_LOG', msg.label, msg.payload)
          return
        }
      } catch {}
    }

    const event = normalizedText

    if (event === events.UPDATING)
      void safePearMessage(PEAR_RUNTIME_UPDATING_MESSAGE)
    if (event === events.UPDATED)
      void safePearMessage(PEAR_RUNTIME_UPDATED_MESSAGE)
  })
}

export default startUpdater

function safePearMessage(payload) {
  if (typeof Pear?.message !== 'function') return
  try {
    return Pear.message(payload)
  } catch {
    try {
      return Pear.message(payload?.type)
    } catch {
      return
    }
  }
}
