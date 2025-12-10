import { workletLogger } from './utils/workletLogger'

let rpc
;(async () => {
  try {
    const { setupIPC, createRPC } = await import('./appCore.js')

    const ipc = setupIPC()
    rpc = createRPC(ipc)
  } catch (error) {
    workletLogger.error('Fatal error in app initialization:', error)
  }
})()

export { rpc }
