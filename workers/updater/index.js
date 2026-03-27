import FramedStream from 'framed-stream'
import PearRuntimeUpdater from 'pear-runtime-updater'

const DEBUG_MODE = false

const pipe = new FramedStream(Pear.worker.pipe())

function sendLog(label, payload) {
  if (!DEBUG_MODE) return
  try {
    pipe.write(
      JSON.stringify({
        type: 'OTA_LOG',
        label,
        payload
      })
    )
  } catch {
    // ignore log errors
  }
}

const opts = {
  dir: Pear.config.args[0],
  upgrade: Pear.config.args[1],
  version: Pear.config.args[2],
  app: Pear.config.args[3] !== 'undefined' ? Pear.config.args[3] : undefined,
  name: Pear.config.args[4]
}
const updater = new PearRuntimeUpdater(opts)

const events = {
  UPDATING: 'UPDATING',
  UPDATED: 'UPDATED'
}

updater.on('error', (err) => {
  sendLog('error', {
    error: err?.message ?? String(err),
    stack: err?.stack
  })
})

updater.on('updating', () => {
  pipe.write(events.UPDATING)
})

updater.on('updated', async () => {
  try {
    await updater.applyUpdate()
    pipe.write(events.UPDATED)
  } catch (err) {
    sendLog('applyUpdateError', {
      error: err?.message ?? String(err),
      stack: err?.stack
    })
  }
})

updater.ready()

Pear.teardown(async () => {
  await updater.close()
})
