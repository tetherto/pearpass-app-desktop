// Native N-API addon; graceful no-op fallbacks on non-macOS platforms.
let native = null;

try {
  native = require('./build/Release/biometric_keychain.node');
} catch (_) {
  // Fall through to no-ops below
}

const NOT_AVAILABLE_ERR = new Error('Biometric keychain is not available on this platform');
NOT_AVAILABLE_ERR.code = 'ERR_NOT_AVAILABLE';

function store(service, account, data) {
  if (!native) throw NOT_AVAILABLE_ERR;
  return native.store(service, account, data);
}

async function retrieve(service, account, reason) {
  if (!native) throw NOT_AVAILABLE_ERR;
  return native.retrieve(service, account, reason);
}

function remove(service, account) {
  if (!native) throw NOT_AVAILABLE_ERR;
  return native.remove(service, account);
}

function isAvailable() {
  if (!native) return false;
  return native.isAvailable();
}

module.exports = { store, retrieve, remove, isAvailable };
