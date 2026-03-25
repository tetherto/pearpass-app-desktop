import child_process from 'child_process'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import {
  MANIFEST_NAME,
  EXTENSION_ID,
  FIREFOX_EXTENSION_ID
} from '@tetherto/pearpass-lib-constants'

import { logger } from './logger'
import flatpakPaths from '../../electron/flatpak-paths.cjs'

const { isFlatpakRuntime, getHostHome } = flatpakPaths

const FLATPAK_APP_ID = 'com.pears.pass'
const FLATPAK_NATIVE_HOST_COMMAND = 'pearpass-native-host'

const NATIVE_BRIDGE_PROCESS_IDENTIFIER = 'pearpass-lib-native-messaging-bridge'

const promisify =
  (fn) =>
  (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, res) => (err ? reject(err) : resolve(res)))
    })
const execAsync = promisify(child_process.exec)

/**
 * Returns platform-specific paths and file names for the native host executable (wrapper)
 * @param {string} userDataPath - Electron userData directory
 * @returns {{ platform: string, executableFileName: string, executablePath: string }}
 */
export const getNativeHostExecutableInfo = (userDataPath) => {
  const platform = os.platform()
  let executableFileName

  switch (platform) {
    case 'darwin':
      executableFileName = 'pearpass-native-host.sh'
      break
    case 'win32':
      executableFileName = 'pearpass-native-host.cmd'
      break
    case 'linux':
      executableFileName = 'pearpass-native-host.sh'
      break
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  const storageDir = path.join(userDataPath, 'native-messaging')
  const executablePath = path.join(storageDir, executableFileName)

  return {
    platform,
    executableFileName,
    executablePath
  }
}

/**
 * Generates a wrapper executable (shell script on Unix, cmd file on Windows)
 * that uses the Electron binary (with ELECTRON_RUN_AS_NODE=1) to run the
 * native messaging bridge script.
 * @param {string} executablePath - Path to write the wrapper
 * @param {string} electronExecPath - Path to the Electron executable
 * @param {string} bridgeScriptPath - Path to the bridge entry point (index.js)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const generateNativeHostExecutable = async (
  executablePath,
  electronExecPath,
  bridgeScriptPath
) => {
  try {
    const platform = os.platform()
    let content

    if (platform === 'linux' && isFlatpakRuntime()) {
      // Chrome runs outside the flatpak sandbox, so the wrapper must
      // re-enter the sandbox via `flatpak run` before execing the bridge.
      // The /app/* electronExecPath and bridgeScriptPath are only valid
      // inside the sandbox and are resolved by the in-sandbox command.
      //
      // Diagnostics MUST go to stderr: Chrome's native-messaging protocol
      // treats anything on stdout as a framed message and will drop the port
      // ("Native host has exited") if we write plain text there.
      content = `#!/bin/bash
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
    } else if (platform === 'darwin' || platform === 'linux') {
      content = `#!/bin/bash
# PearPass Native Messaging Host
# Runs the native messaging bridge via Electron's embedded Node.js

export ELECTRON_RUN_AS_NODE=1
exec "${electronExecPath}" "${bridgeScriptPath}"
`
    } else if (platform === 'win32') {
      content = `@echo off
REM PearPass Native Messaging Host
REM Runs the native messaging bridge via Electron's embedded Node.js

set ELECTRON_RUN_AS_NODE=1
"${electronExecPath}" "${bridgeScriptPath}"
`
    } else {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    await fs.writeFile(executablePath, content, 'utf8')
    if (platform !== 'win32') {
      await fs.chmod(executablePath, 0o755)
    }

    logger.info(
      'NATIVE-MESSAGING-SETUP',
      `Generated native messaging executable at: ${executablePath}`
    )

    return {
      success: true,
      message: 'Native messaging executable generated successfully'
    }
  } catch (error) {
    logger.error(
      'NATIVE-MESSAGING-SETUP',
      `Failed to generate executable: ${error.message}`
    )
    return {
      success: false,
      message: `Failed to generate executable: ${error.message}`
    }
  }
}

/**
 * Returns platform-specific browser entries for native messaging manifest installation.
 * Each entry includes a browserDir for detecting whether the browser is installed.
 * @returns {{ browsers: Array<{name: string, browserDir: string|null, manifestPath: string, registryKey?: string}> }}
 */
export const getNativeMessagingLocations = () => {
  const platform = os.platform()
  // Under flatpak, os.homedir() is the per-app sandbox home; browsers on the
  // host read manifests from the real host home. Use that path instead.
  const home =
    platform === 'linux' && isFlatpakRuntime() ? getHostHome() : os.homedir()
  const manifestFile = `${MANIFEST_NAME}.json`
  const browsers = []

  switch (platform) {
    case 'darwin':
      browsers.push(
        {
          name: 'Google Chrome',
          browserDir: path.join(
            home,
            'Library',
            'Application Support',
            'Google',
            'Chrome'
          ),
          manifestPath: path.join(
            home,
            'Library',
            'Application Support',
            'Google',
            'Chrome',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Microsoft Edge',
          browserDir: path.join(
            home,
            'Library',
            'Application Support',
            'Microsoft Edge'
          ),
          manifestPath: path.join(
            home,
            'Library',
            'Application Support',
            'Microsoft Edge',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Chromium',
          browserDir: path.join(
            home,
            'Library',
            'Application Support',
            'Chromium'
          ),
          manifestPath: path.join(
            home,
            'Library',
            'Application Support',
            'Chromium',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Brave',
          browserDir: path.join(
            home,
            'Library',
            'Application Support',
            'BraveSoftware',
            'Brave-Browser'
          ),
          manifestPath: path.join(
            home,
            'Library',
            'Application Support',
            'BraveSoftware',
            'Brave-Browser',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Firefox',
          isFirefox: true,
          browserDir: path.join(
            home,
            'Library',
            'Application Support',
            'Mozilla'
          ),
          manifestPath: path.join(
            home,
            'Library',
            'Application Support',
            'Mozilla',
            'NativeMessagingHosts',
            manifestFile
          )
        }
      )
      break

    case 'win32': {
      const nativeMessagingDir = path.join(
        home,
        'AppData',
        'Local',
        'PearPass',
        'NativeMessaging'
      )
      const manifestPath = path.join(nativeMessagingDir, manifestFile)
      const firefoxManifestPath = path.join(
        nativeMessagingDir,
        `${MANIFEST_NAME}.firefox.json`
      )
      browsers.push(
        {
          name: 'Google Chrome',
          browserDir: null,
          manifestPath,
          registryKey: `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${MANIFEST_NAME}`
        },
        {
          name: 'Microsoft Edge',
          browserDir: null,
          manifestPath,
          registryKey: `HKCU\\Software\\Microsoft\\Edge\\NativeMessagingHosts\\${MANIFEST_NAME}`
        },
        {
          name: 'Chromium',
          browserDir: null,
          manifestPath,
          registryKey: `HKCU\\Software\\Chromium\\NativeMessagingHosts\\${MANIFEST_NAME}`
        },
        {
          name: 'Brave',
          browserDir: null,
          manifestPath,
          registryKey: `HKCU\\Software\\BraveSoftware\\Brave-Browser\\NativeMessagingHosts\\${MANIFEST_NAME}`
        },
        {
          name: 'Firefox',
          isFirefox: true,
          browserDir: null,
          manifestPath: firefoxManifestPath,
          registryKey: `HKCU\\Software\\Mozilla\\NativeMessagingHosts\\${MANIFEST_NAME}`
        }
      )
      break
    }

    case 'linux':
      browsers.push(
        {
          name: 'Google Chrome',
          browserDir: path.join(home, '.config', 'google-chrome'),
          manifestPath: path.join(
            home,
            '.config',
            'google-chrome',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Chromium',
          browserDir: path.join(home, '.config', 'chromium'),
          manifestPath: path.join(
            home,
            '.config',
            'chromium',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Microsoft Edge',
          browserDir: path.join(home, '.config', 'microsoft-edge'),
          manifestPath: path.join(
            home,
            '.config',
            'microsoft-edge',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Chromium (Snap)',
          browserDir: path.join(home, 'snap', 'chromium', 'common', 'chromium'),
          manifestPath: path.join(
            home,
            'snap',
            'chromium',
            'common',
            'chromium',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Brave',
          browserDir: path.join(
            home,
            '.config',
            'BraveSoftware',
            'Brave-Browser'
          ),
          manifestPath: path.join(
            home,
            '.config',
            'BraveSoftware',
            'Brave-Browser',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Brave (Snap)',
          browserDir: path.join(home, 'snap', 'brave', 'current'),
          manifestPath: path.join(
            home,
            'snap',
            'brave',
            'current',
            '.config',
            'BraveSoftware',
            'Brave-Browser',
            'NativeMessagingHosts',
            manifestFile
          )
        },
        {
          name: 'Firefox',
          isFirefox: true,
          browserDir: path.join(home, '.mozilla'),
          manifestPath: path.join(
            home,
            '.mozilla',
            'native-messaging-hosts',
            manifestFile
          )
        }
      )
      break

    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  return { browsers }
}

/**
 * Removes native messaging manifest files and registry entries
 * This prevents the browser from respawning the host when integration is disabled.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const cleanupNativeMessaging = async () => {
  try {
    const { browsers } = getNativeMessagingLocations()

    let removedCount = 0
    const removedPaths = new Set()

    for (const browser of browsers) {
      // Windows shares one manifest path across different browsers
      if (!removedPaths.has(browser.manifestPath)) {
        removedPaths.add(browser.manifestPath)
        try {
          await fs.unlink(browser.manifestPath)
          removedCount++
          logger.info(
            'NATIVE-MESSAGING-CLEANUP',
            `Removed manifest file: ${browser.manifestPath}`
          )
        } catch (err) {
          if (err.code !== 'ENOENT') {
            logger.error(
              'NATIVE-MESSAGING-CLEANUP',
              `Failed to remove manifest at ${browser.manifestPath}: ${err.message}`
            )
          }
        }
      }

      if (browser.registryKey) {
        const cmd = `reg delete "${browser.registryKey}" /f`
        try {
          await execAsync(cmd)
          logger.info(
            'NATIVE-MESSAGING-CLEANUP',
            `Removed registry key: ${browser.registryKey}`
          )
        } catch (err) {
          logger.error(
            'NATIVE-MESSAGING-CLEANUP',
            `Failed to remove registry key '${browser.registryKey}': ${err.message}`
          )
        }
      }
    }

    const message =
      removedCount > 0
        ? `Native messaging cleanup completed. Removed ${removedCount} manifest file(s).`
        : 'No native messaging manifest files found to remove.'

    return {
      success: true,
      message
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to cleanup native messaging: ${error.message}`
    }
  }
}

/**
 * Kills running native messaging host processes so the browser can respawn them
 * and re-read the manifest with the updated allowed_origins.
 * Safe to call on macOS/Linux/Windows; no-op if process is not found.
 * @returns {Promise<void>}
 */
export const killNativeMessagingHostProcesses = async () => {
  try {
    const platform = os.platform()

    if (platform === 'win32') {
      // Find processes with the bridge module in their command line and force-kill them
      try {
        const psCmd = `powershell -NoProfile -Command "Get-WmiObject Win32_Process | Where-Object {\$_.CommandLine -like '*${NATIVE_BRIDGE_PROCESS_IDENTIFIER}*'} | ForEach-Object { taskkill /PID \$_.ProcessId /F }"`
        await execAsync(psCmd)
        logger.info(
          'NATIVE-MESSAGING-KILL',
          'Windows: Killed native messaging host processes'
        )
      } catch (error) {
        logger.info(
          'NATIVE-MESSAGING-KILL',
          `Windows: No native messaging processes found to kill: ${error.message}`
        )
      }
    } else {
      // macOS/Linux: the wrapper uses 'exec' so the bridge module path appears in the process args
      try {
        await execAsync(`pkill -f "${NATIVE_BRIDGE_PROCESS_IDENTIFIER}"`)
        logger.info(
          'NATIVE-MESSAGING-KILL',
          'Killed native messaging host process'
        )
      } catch (error) {
        logger.info(
          'NATIVE-MESSAGING-KILL',
          `No native messaging host process found to kill: ${error.message}`
        )
      }
    }
  } catch (error) {
    logger.error(
      'NATIVE-MESSAGING-KILL',
      `Failed to kill host processes: ${error.message}`
    )
  }
}

/**
 * Sets up native messaging for a given extension ID
 * @returns {Promise<{success: boolean, message: string, manifestPath?: string}>}
 */
export const setupNativeMessaging = async ({
  userDataPath,
  execPath,
  bridgePath
}) => {
  try {
    // Determine platform-specific executable path and names
    const { platform, executablePath } =
      getNativeHostExecutableInfo(userDataPath)

    // Ensure directory for executable exists
    await fs.mkdir(path.dirname(executablePath), { recursive: true })

    // Generate the native messaging executable wrapper
    const execResult = await generateNativeHostExecutable(
      executablePath,
      execPath,
      bridgePath
    )
    if (!execResult.success) {
      throw new Error(execResult.message)
    }

    const extensionId = localStorage.getItem('EXTENSION_ID') || EXTENSION_ID

    // Create Chromium native messaging manifest
    const chromiumManifest = {
      name: MANIFEST_NAME,
      description: 'PearPass Native Messaging Host',
      path: executablePath,
      type: 'stdio',
      allowed_origins: [`chrome-extension://${extensionId}/`]
    }

    // Create Firefox native messaging manifest
    const firefoxManifest = {
      name: MANIFEST_NAME,
      description: 'PearPass Native Messaging Host',
      path: executablePath,
      type: 'stdio',
      allowed_extensions: [FIREFOX_EXTENSION_ID]
    }

    const { browsers } = getNativeMessagingLocations()
    const installedPaths = []

    for (const browser of browsers) {
      // Skip browsers not installed on this system
      if (browser.browserDir) {
        try {
          await fs.access(browser.browserDir)
        } catch {
          logger.info(
            'NATIVE-MESSAGING-SETUP',
            `Skipping ${browser.name}: browser directory not found at ${browser.browserDir}`
          )
          continue
        }
      }

      try {
        const manifest = browser.isFirefox ? firefoxManifest : chromiumManifest
        await fs.mkdir(path.dirname(browser.manifestPath), { recursive: true })
        await fs.writeFile(
          browser.manifestPath,
          JSON.stringify(manifest, null, 2)
        )

        if (platform !== 'win32') {
          await fs.chmod(browser.manifestPath, 0o644)
        }

        installedPaths.push(browser.manifestPath)
        logger.info(
          'NATIVE-MESSAGING-SETUP',
          `Installed manifest for ${browser.name} at ${browser.manifestPath}`
        )
      } catch (err) {
        logger.error(
          'NATIVE-MESSAGING-SETUP',
          `Failed to write manifest for ${browser.name} at ${browser.manifestPath}: ${err.message}`
        )
      }

      if (browser.registryKey) {
        const cmd = `reg add "${browser.registryKey}" /ve /d "${browser.manifestPath}" /f`
        try {
          await execAsync(cmd)
        } catch (err) {
          logger.error(
            'NATIVE-MESSAGING-SETUP',
            `Failed to write registry key '${browser.registryKey}': ${err.message}`
          )
        }
      }
    }

    return {
      success: true,
      message: 'Native messaging host installed successfully',
      manifestPath: installedPaths.join(', ')
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to setup native messaging: ${error.message}`
    }
  }
}
