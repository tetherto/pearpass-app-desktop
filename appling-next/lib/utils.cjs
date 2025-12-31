const prettyBytes = require("prettier-bytes");

function encode(msg) {
  return JSON.stringify(msg);
}

function decode(msg) {
  return JSON.parse(msg.toString());
}

function format(u) {
  if (u.drive?.core) {
    return {
      speed: prettyBytes(u.downloadSpeed()) + "/s",
      progress: u.downloadProgress,
      peers: u.drive.core.peers.length,
      bytes: u.downloadedBytes,
    };
  }

  return {
    speed:
      u.downloadSpeed === 0 ? undefined : prettyBytes(u.downloadSpeed) + "/s",
    progress: u.downloadProgress === 0 ? undefined : u.downloadProgress,
    peers: u.peers === 0 ? undefined : u.peers,
    bytes: u.downloadedBytes,
  };
}

module.exports = { encode, decode, format };
