const fsp = require('fs/promises')

const FLATPAK_APP_ID = 'com.pears.pass'
const FLATPAK_NATIVE_HOST_COMMAND = 'pearpass-native-host'

// Wrappers emit diagnostics to stderr only: Chrome reads stdout as framed
// native-messaging payloads, so any plain text there drops the port with
// "Native host has exited".
function buildWrapperContent({
  platform,
  isFlatpak,
  electronExecPath,
  bridgeScriptPath
}) {
  if (platform === 'linux' && isFlatpak) {
    // Chrome runs outside the flatpak sandbox; the wrapper re-enters via
    // `flatpak run` so the in-sandbox /app/* paths resolve correctly.
    return `#!/bin/bash
# PearPass Native Messaging Host (flatpak)
# Chrome launches this on the host; re-enter the sandbox to run the bridge.
set -u

FLATPAK_BIN="$(command -v flatpak 2>/dev/null || true)"
if [ -z "\${FLATPAK_BIN}" ]; then
  for candidate in /usr/bin/flatpak /usr/local/bin/flatpak /var/lib/flatpak/exports/bin/flatpak; do
    if [ -x "\${candidate}" ]; then
      FLATPAK_BIN="\${candidate}"
      break
    fi
  done
fi
if [ -z "\${FLATPAK_BIN}" ]; then
  echo "pearpass-native-host: flatpak binary not found on PATH" >&2
  exit 127
fi

exec "\${FLATPAK_BIN}" run --command=${FLATPAK_NATIVE_HOST_COMMAND} ${FLATPAK_APP_ID} "$@"
`
  }

  if (platform === 'darwin' || platform === 'linux') {
    return `#!/bin/bash
# PearPass Native Messaging Host
# Runs the native messaging bridge via Electron's embedded Node.js

export ELECTRON_RUN_AS_NODE=1
exec "${electronExecPath}" "${bridgeScriptPath}"
`
  }

  if (platform === 'win32') {
    return `@echo off
REM PearPass Native Messaging Host
REM Runs the native messaging bridge via Electron's embedded Node.js

set ELECTRON_RUN_AS_NODE=1
"${electronExecPath}" "${bridgeScriptPath}"
`
  }

  throw new Error(`Unsupported platform: ${platform}`)
}

// Atomic so Chrome can't read a half-written wrapper while spawning the host.
async function writeWrapperAtomic(executablePath, content, platform) {
  const tmpPath = `${executablePath}.tmp-${process.pid}`
  await fsp.writeFile(tmpPath, content, 'utf8')
  if (platform !== 'win32') {
    await fsp.chmod(tmpPath, 0o755)
  }
  await fsp.rename(tmpPath, executablePath)
}

async function refreshNativeHostWrapperIfPresent({
  executablePath,
  electronExecPath,
  bridgeScriptPath,
  platform,
  isFlatpak
}) {
  try {
    await fsp.access(executablePath)
  } catch {
    return { refreshed: false, reason: 'not-present' }
  }

  const content = buildWrapperContent({
    platform,
    isFlatpak,
    electronExecPath,
    bridgeScriptPath
  })
  await writeWrapperAtomic(executablePath, content, platform)
  return { refreshed: true }
}

module.exports = {
  buildWrapperContent,
  writeWrapperAtomic,
  refreshNativeHostWrapperIfPresent
}
