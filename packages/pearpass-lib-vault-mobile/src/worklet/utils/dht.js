import DHT from 'hyperdht'

let sharedDHT = null

export const getSharedDHT = () => {
  if (!sharedDHT) {
    sharedDHT = new DHT()
  }
  return sharedDHT
}

export const destroySharedDHT = async () => {
  if (sharedDHT) {
    try {
      await sharedDHT.destroy()
    } catch {}
    sharedDHT = null
  }
}
