import child_process from 'child_process'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import {
  MANIFEST_NAME,
  NATIVE_MESSAGING_BRIDGE_PEAR_LINK,
  EXTENSION_ID
} from 'pearpass-lib-constants'

import { logger } from './logger'

const promisify =
  (fn) =>
  (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, res) => (err ? reject(err) : resolve(res)))
    })
const execAsync = promisify(child_process.exec)

/**
 * Returns platform-specific paths and file names for the native host executable (wrapper)
 * @returns {{ platform: string, executableFileName: string, executablePath: string }}
 */
export const getNativeHostExecutableInfo = () => {
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

  const storageDir = path.join(Pear.config.storage, 'native-messaging')
  const executablePath = path.join(storageDir, executableFileName)

  return {
    platform,
    executableFileName,
    executablePath
  }
}

/**
 * Generates a wrapper executable (shell script on Unix, cmd file on Windows)
 * @param {string} executablePath - Path to write the wrapper
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const generateNativeHostExecutable = async (executablePath) => {
  try {
    const platform = os.platform()
    const arch = os.arch()
    const bridgePath = path.dirname(executablePath)
    let content

    if (platform === 'darwin') {
      const pearPath = path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'pear',
        'current',
        'by-arch',
        `${platform}-${arch}`,
        'bin',
        'pear-runtime'
      )
      content = `#!/bin/bash
# PearPass Native Messaging Host for macOS
# Launches the native host using pear run

cd "${bridgePath}"
exec "${pearPath}" run --trusted ${NATIVE_MESSAGING_BRIDGE_PEAR_LINK}
`
    } else if (platform === 'linux') {
      const pearPath = path.join(
        os.homedir(),
        '.config',
        'pear',
        'current',
        'by-arch',
        `${platform}-${arch}`,
        'bin',
        'pear-runtime'
      )
      content = `#!/bin/bash
# PearPass Native Messaging Host for Linux
# Launches the native host using pear run

cd "${bridgePath}"
exec "${pearPath}" run --trusted ${NATIVE_MESSAGING_BRIDGE_PEAR_LINK}
`
    } else if (platform === 'win32') {
      const pearPath = path.join(
        os.homedir(),
        'AppData',
        'Roaming',
        'pear',
        'current',
        'by-arch',
        `${platform}-${arch}`,
        'bin',
        'pear-runtime.exe'
      )
      content = `@echo off
REM PearPass Native Messaging Host for Windows
REM Launches the native host using pear run

cd /d "${bridgePath}"
"${pearPath}" run --trusted ${NATIVE_MESSAGING_BRIDGE_PEAR_LINK}
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
 * Returns platform-specific manifest file paths and (on Windows) registry keys
 * @returns {{ platform: string, manifestPaths: string[], registryKeys: string[] }}
 */
export const getNativeMessagingLocations = () => {
  const platform = os.platform()
  const home = os.homedir()
  const manifestFile = `${MANIFEST_NAME}.json`
  let manifestPaths = []
  let registryKeys = []

  switch (platform) {
    case 'darwin':
      manifestPaths = [
        path.join(
          home,
          'Library',
          'Application Support',
          'Google',
          'Chrome',
          'NativeMessagingHosts',
          manifestFile
        ),
        path.join(
          home,
          'Library',
          'Application Support',
          'Microsoft Edge',
          'NativeMessagingHosts',
          manifestFile
        )
      ]
      break

    case 'win32':
      manifestPaths = [
        path.join(
          home,
          'AppData',
          'Local',
          'PearPass',
          'NativeMessaging',
          manifestFile
        )
      ]
      registryKeys = [
        `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${MANIFEST_NAME}`,
        `HKCU\\Software\\Microsoft\\Edge\\NativeMessagingHosts\\${MANIFEST_NAME}`
      ]
      break

    case 'linux':
      manifestPaths = [
        path.join(
          home,
          '.config',
          'google-chrome',
          'NativeMessagingHosts',
          manifestFile
        ),
        path.join(
          home,
          '.config',
          'chromium',
          'NativeMessagingHosts',
          manifestFile
        ),
        path.join(
          home,
          '.config',
          'microsoft-edge',
          'NativeMessagingHosts',
          manifestFile
        )
      ]
      break

    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  return { platform, manifestPaths, registryKeys }
}

/**
 * Removes native messaging manifest files and registry entries
 * This prevents the browser from respawning the host when integration is disabled.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const cleanupNativeMessaging = async () => {
  try {
    const { platform, manifestPaths, registryKeys } =
      getNativeMessagingLocations()

    let removedCount = 0

    // Remove manifest files
    for (const manifestPath of manifestPaths) {
      try {
        await fs.unlink(manifestPath)
        removedCount++
        logger.info(
          'NATIVE-MESSAGING-CLEANUP',
          `Removed manifest file: ${manifestPath}`
        )
      } catch (err) {
        // File might not exist, which is fine
        if (err.code !== 'ENOENT') {
          logger.error(
            'NATIVE-MESSAGING-CLEANUP',
            `Failed to remove manifest at ${manifestPath}: ${err.message}`
          )
        }
      }
    }

    // Windows Registry Cleanup
    if (platform === 'win32') {
      for (const key of registryKeys) {
        const cmd = `reg delete "${key}" /f`
        try {
          await execAsync(cmd)
          logger.info(
            'NATIVE-MESSAGING-CLEANUP',
            `Removed registry key: ${key}`
          )
        } catch (err) {
          // Registry key might not exist, which is fine
          logger.error(
            'NATIVE-MESSAGING-CLEANUP',
            `Failed to remove registry key '${key}': ${err.message}`
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
    const { platform } = getNativeHostExecutableInfo()

    if (platform === 'win32') {
      // Windows: Kill the pear-runtime.exe process running our native messaging bridge
      // The parent cmd.exe (spawned by Chrome) will automatically terminate when its child is killed
      try {
        // Use PowerShell to find processes with the unique bridge seed in their command line
        const psCmd = `powershell -NoProfile -Command "Get-WmiObject Win32_Process | Where-Object {\$_.CommandLine -like '*${NATIVE_MESSAGING_BRIDGE_PEAR_LINK}*'} | ForEach-Object { taskkill /PID \$_.ProcessId /F }"`
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
      // macOS/Linux: Kill by the bridge seed in the command line
      // The wrapper script uses 'exec' so the process name becomes 'pear run <seed>'
      try {
        await execAsync(`pkill -f "${NATIVE_MESSAGING_BRIDGE_PEAR_LINK}"`)
        logger.info(
          'NATIVE-MESSAGING-KILL',
          'Killed native messaging host process by bridge seed'
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
export const setupNativeMessaging = async () => {
  try {
    // Determine platform-specific executable path and names
    const { platform, executablePath } = getNativeHostExecutableInfo()

    // Ensure directory for executable exists
    await fs.mkdir(path.dirname(executablePath), { recursive: true })

    // Generate the native messaging executable wrapper
    const execResult = await generateNativeHostExecutable(executablePath)
    if (!execResult.success) {
      throw new Error(execResult.message)
    }

    const extensionId = localStorage.getItem('EXTENSION_ID') || EXTENSION_ID

    // Create native messaging manifest
    const manifest = {
      name: MANIFEST_NAME,
      description: 'PearPass Native Messaging Host',
      path: executablePath,
      type: 'stdio',
      allowed_origins: [`chrome-extension://${extensionId}/`]
    }

    // Get manifest paths (and registry keys on Windows)
    const { manifestPaths, registryKeys } = getNativeMessagingLocations()

    // Write manifest to all relevant paths
    for (const manifestPath of manifestPaths) {
      try {
        await fs.mkdir(path.dirname(manifestPath), { recursive: true })
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

        if (platform !== 'win32') {
          await fs.chmod(manifestPath, 0o644)
        }
      } catch (err) {
        logger.error(
          'NATIVE-MESSAGING-SETUP',
          `Failed to write manifest at ${manifestPath}: ${err.message}`
        )
      }
    }

    // Windows Registry Setup
    if (platform === 'win32') {
      const manifestPath = manifestPaths[0]
      for (const key of registryKeys) {
        const cmd = `reg add "${key}" /ve /d "${manifestPath}" /f`
        try {
          await execAsync(cmd)
        } catch (err) {
          logger.error(
            'NATIVE-MESSAGING-SETUP',
            `Failed to write registry key '${key}': ${err.message}`
          )
        }
      }
    }

    return {
      success: true,
      message: 'Native messaging host installed successfully',
      manifestPath: manifestPaths.join(', ')
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to setup native messaging: ${error.message}`
    }
  }
}
