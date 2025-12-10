import { handleRpcCommand } from './appCore'
import { destroySharedDHT } from './utils/dht'
import { isPearWorker } from './utils/isPearWorker'
import { workletLogger } from './utils/workletLogger'

const ipc = isPearWorker() ? Pear.worker.pipe() : BareKit.IPC

ipc.on('data', async (buffer) => {
  const rawData = buffer.toString('utf8')

  try {
    const { command, data } = JSON.parse(rawData)
    workletLogger.log('Received message:', { command, data })

    const req = {
      command: command,
      data: JSON.stringify(data),
      reply: (data) => {
        BareKit.IPC.write(data)
      },
      createRequestStream: () => {},
      createResponseStream: () => {},
      send: () => {}
    }

    await handleRpcCommand(req, true)
  } catch (error) {
    workletLogger.error('Error receiving message:', error)
  }
})

ipc.on('close', async () => {
  await destroySharedDHT()
  // eslint-disable-next-line no-undef
  Bare.exit(0)
})

ipc.on('end', async () => {
  await destroySharedDHT()
  // eslint-disable-next-line no-undef
  Bare.exit(0)
})
