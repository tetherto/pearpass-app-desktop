export async function getConfig(store) {
  try {
    const Swarmconf = require('@tetherto/swarmconf')
    const conf = new Swarmconf(store)
    await conf.ready()
    return conf
  } catch (e) {
    // Package not installed, so we return a dummy config
    // You can replace this with your own Hyperconf instance
    // see https://github.com/holepunchto/hyperconf
    return {
      current: {
        version: 0,
        blindRelays: [],
        blindPeers: []
      }
    }
  }
}
