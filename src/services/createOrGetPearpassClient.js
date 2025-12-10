import { workletLogger, PearpassVaultClient } from 'pearpass-lib-vault-mobile'

let pearpassClient = null

/**
 * @param {import('pearpass-lib-vault-mobile').PearpassVaultClient} [ipc]
 * @param {string} [storagePath]  absolute path where vaults live
 * @param {{ debugMode?: boolean }} [opts={}]
 * @returns {PearpassVaultClient}
 */
export function createOrGetPearpassClient(ipc, storagePath, opts = {}) {
  if (!pearpassClient) {
    if (!ipc || !storagePath) {
      throw new Error(
        'createOrGetPearpassClient: ipc and storagePath are required for initial client creation'
      )
    }
    pearpassClient = new PearpassVaultClient(ipc, storagePath, opts)

    workletLogger.setLogOutput(getLogger('none'))
  }

  return pearpassClient
}

/**
 * Choose what level of detail the objects should get logged to `console.debug` output.
 * - `'full'` - everything gets logged. This can cause slow-downs for file transfers.
 * - `'stub'` - objects gets shrunk to their `toString` representation: `'[object Object]'`.
 * - `'none'` - nothing gets logged;
 *
 * @param {'none' | 'stub' | 'full'} level
 */
function getLogger(level) {
  // eslint-disable-next-line no-console
  if (level === 'full') return console.debug
  if (level === 'stub') return stubLogger
  return noop
}

function stubLogger(...args) {
  // eslint-disable-next-line no-console
  console.debug(args.join(' '))
}
function noop() {}
