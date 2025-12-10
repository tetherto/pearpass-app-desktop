/** @typedef {import('pear-interface')} */ /* global Pear */

export class Logger {
  constructor({ debugMode }) {
    this.debugMode = debugMode || false
  }

  log(...messages) {
    if (!this.debugMode) return
    console.log(messages)
  }

  error(...messages) {
    console.error(messages)
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
