/* eslint-disable no-console */
/**
 * Main-process logger. Behavior:
 * - debugMode false: no logs folder, no main.log, no output (all methods no-op).
 * - debugMode true + app packaged: create userData/logs/main.log, log to console and file.
 * - debugMode true + app not packaged: log to console only; no logs folder, no file.
 * @param {{ app: { isPackaged: boolean }, debugMode?: boolean }} options
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const { inspect } = require('util')

function createMainProcessLogger(options = {}) {
  const { app, debugMode = false } = options

  // debugMode false: no logs folder, no file, no logging
  if (!debugMode) {
    return {
      setLogPath() {},
      log() {},
      info() {},
      debug() {},
      warn() {},
      error() {}
    }
  }

  // debugMode true: log to console; only create logs/main.log when packaged
  let logFilePath = null
  const isPackaged = app && app.isPackaged

  function serialize(args) {
    return args
      .map((arg) => {
        if (arg instanceof Error) {
          return `${arg.message}${arg.stack ? '\n' + arg.stack : ''}`
        }
        if (typeof arg === 'object' && arg !== null) {
          return inspect(arg, { depth: 4, breakLength: 120 })
        }
        return String(arg)
      })
      .join(' ')
  }

  function writeToFile(level, ...args) {
    if (!isPackaged || !logFilePath) return
    try {
      const line = `${new Date().toISOString()} [${level}] ${serialize(args)}\n`
      fs.appendFileSync(logFilePath, line)
    } catch (err) {
      console.error('[MAIN] Failed to write to log file:', err)
    }
  }

  return {
    setLogPath(userDataDir) {
      if (!isPackaged) return
      const dir = path.join(userDataDir, 'logs')
      try {
        fs.mkdirSync(dir, { recursive: true })
        logFilePath = path.join(dir, 'main.log')
        writeToFile('INFO', 'Main process log file:', logFilePath)
        console.info('[MAIN] Log file:', logFilePath)
      } catch (err) {
        console.error('[MAIN] Failed to create log dir:', err.message, dir)
        const fallback = path.join(os.tmpdir(), 'main-process.log')
        try {
          logFilePath = fallback
          writeToFile('INFO', 'Main process log file (fallback):', logFilePath)
          console.info('[MAIN] Log file (fallback):', logFilePath)
        } catch (e) {
          console.error('[MAIN] Fallback log also failed:', e.message)
        }
      }
    },

    log(...args) {
      console.info('[MAIN]', ...args)
      writeToFile('LOG', ...args)
    },
    info(...args) {
      console.info('[MAIN][INFO]', ...args)
      writeToFile('INFO', ...args)
    },
    debug(...args) {
      console.info('[MAIN][DEBUG]', ...args)
      writeToFile('DEBUG', ...args)
    },
    warn(...args) {
      console.warn('[MAIN][WARN]', ...args)
      writeToFile('WARN', ...args)
    },
    error(...args) {
      console.error('[MAIN][ERROR]', ...args)
      writeToFile('ERROR', ...args)
    }
  }
}

module.exports = { createMainProcessLogger }
