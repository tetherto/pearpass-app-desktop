/** @typedef {import('pear-interface')} */

class Logger {
  constructor({ debugMode = false } = {}) {
    this.debugMode = debugMode
  }

  /**
   * Log a message with component and level
   * @param {'INFO'|'ERROR'|'DEBUG'|'WARN'} level - Log level
   * @param {string} component - Component name
   * @param {any[]} message - Log message
   */
  _print(level, component, message) {
    if (!this.debugMode) return

    const timestamp = new Date().toISOString()
    const formatted = `${timestamp} [${level}] [${component}]`

    if (level === 'ERROR') {
      // eslint-disable-next-line no-console
      console.error(formatted, message)
      return
    }

    // eslint-disable-next-line no-console
    console.log(formatted, message)
  }

  /**
   * Log a message with component and level
   * @param {string} component - Component name
   * @param {any[]} message - Log message
   */
  log(component, ...args) {
    this._print('LOG', component, ...args)
  }

  /**
   * Log a message with component and level
   * @param {string} component - Component name
   * @param {any[]} message - Log message
   */
  debug(component, ...args) {
    this._print('DEBUG', component, ...args)
  }

  /**
   * Log a message with component and level
   * @param {string} component - Component name
   * @param {any[]} message - Log message
   */
  info(component, ...args) {
    this._print('INFO', component, ...args)
  }

  /**
   * Log a message with component and level
   * @param {string} component - Component name
   * @param {any[]} message - Log message
   */
  warn(component, ...args) {
    this._print('WARN', component, ...args)
  }

  /**
   * Log a message with component and level
   * @param {string} component - Component name
   * @param {any[]} message - Log message
   */
  error(component, ...args) {
    this._print('ERROR', component, ...args)
  }
}

// const isProduction =
//   (typeof Pear !== 'undefined' && !!Pear.config?.key) ||
//   (typeof process !== 'undefined' &&
//     process.env &&
//     process.env.NODE_ENV === 'production')

export const logger = new Logger({
  debugMode: false
})
