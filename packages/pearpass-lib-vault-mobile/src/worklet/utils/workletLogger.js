// Noop function for production logging
const noop = () => {}

class WorkletLogger {
  constructor({ debugMode = false } = {}) {
    // eslint-disable-next-line no-console
    this.output = console.log
    this.debugMode = debugMode
  }

  setLogOutput(output) {
    this.output = output
  }

  setDebugMode(enabled) {
    this.debugMode = enabled
  }

  _print(type, ...args) {
    if (!this.debugMode) return

    if (this.output === noop || typeof this.output !== 'function') return

    this.output(`[${type}] [BARE_RPC]`, ...args)
  }

  log(...args) {
    this._print('LOG', ...args)
  }

  debug(...args) {
    this._print('DEBUG', ...args)
  }

  info(...args) {
    this._print('INFO', ...args)
  }

  warn(...args) {
    this._print('WARN', ...args)
  }

  error(...args) {
    this._print('ERROR', ...args)
  }
}

// const isProduction =
//   (typeof Pear !== 'undefined' && !!Pear.config?.key) ||
//   (typeof process !== 'undefined' &&
//     process.env &&
//     process.env.NODE_ENV === 'production')

// Create a default WorkletLogger instance
const workletLogger = new WorkletLogger({ debugMode: false })

workletLogger.setDebugMode(false)
workletLogger.setLogOutput(noop)

// Export both the workletLogger instance and the class
export { workletLogger, WorkletLogger }
