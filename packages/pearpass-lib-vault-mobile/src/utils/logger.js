export class Logger {
  constructor({ debugMode }) {
    this.debugMode = debugMode || false
  }

  log(...messages) {
    if (!this.debugMode) {
      return
    }

    console.log(messages)
  }

  error(...messages) {
    console.error(messages)
  }
}

export const logger = new Logger({
  debugMode: false
})
