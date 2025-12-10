/** @typedef {import('pear-interface')} */ /* global Pear */
import pearRun from 'pear-run'

let pipe

const WORKLET_PATH_DEV =
  './node_modules/pearpass-lib-vault-mobile/src/worklet/app.js'
const WORKLET_PATH_PROD =
  Pear.config.applink +
  '/node_modules/pearpass-lib-vault-mobile/src/worklet/app.js'

/**
 * @returns {Pipe} The Pear worker pipe.
 */
export const createOrGetPipe = () => {
  if (pipe) {
    return pipe
  }

  pipe = pearRun(Pear.config.key ? WORKLET_PATH_PROD : WORKLET_PATH_DEV)

  Pear.teardown(() => {
    if (pipe) {
      pipe.end()
      pipe = null
    }
  })

  return pipe
}
