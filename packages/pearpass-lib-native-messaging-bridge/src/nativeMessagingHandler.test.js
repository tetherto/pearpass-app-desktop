import { NativeMessagingHandler } from './nativeMessagingHandler'

const {
  wrapMessage,
  unwrapMessage,
  isWrappedMessage
} = require('./nativeMessagingProtocol')
const { log } = require('./utils/log')

// Mocks
jest.mock('./nativeMessagingProtocol', () => ({
  wrapMessage: jest.fn((msg) => ({ wrapped: true, payload: msg })),
  unwrapMessage: jest.fn((msg) => msg.payload),
  isWrappedMessage: jest.fn((msg) => !!msg.wrapped)
}))
jest.mock('./utils/log', () => ({
  log: jest.fn()
}))

describe('NativeMessagingHandler', () => {
  let handler

  beforeEach(() => {
    handler = new NativeMessagingHandler()
    // handler.useRobustParsing = false // test standard parsing by default
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('constructor initializes properties', () => {
    expect(handler.inputBuffer).toBeInstanceOf(Buffer)
    expect(handler.messageInProgress).toBe(false)
    expect(handler.expectedMessageLength).toBe(0)
    expect(handler.accumulatedString).toBe('')
    expect(handler.useRobustParsing).toBe(true)
  })

  test('_ensureBuffer returns buffer', () => {
    const buf = Buffer.from('abc')
    expect(handler._ensureBuffer(buf)).toBe(buf)
    expect(handler._ensureBuffer('abc')).toEqual(Buffer.from('abc', 'binary'))
  })

  test('_readMessageLength sets expectedMessageLength and messageInProgress', () => {
    const msg = { foo: 'bar' }
    const json = JSON.stringify(msg)
    const buf = Buffer.alloc(4 + Buffer.byteLength(json))
    buf.writeUInt32LE(Buffer.byteLength(json), 0)
    buf.write(json, 4)
    handler.inputBuffer = buf
    expect(handler._readMessageLength()).toBe(true)
    expect(handler.expectedMessageLength).toBe(Buffer.byteLength(json))
    expect(handler.messageInProgress).toBe(true)
  })

  test('_readMessageLength returns false if message too large', () => {
    handler.inputBuffer = Buffer.alloc(4)
    handler.inputBuffer.writeUInt32LE(1024 * 1024 + 1, 0)
    expect(handler._readMessageLength()).toBe(false)
    expect(log).toHaveBeenCalledWith(
      'ERROR',
      expect.stringContaining('Message too large')
    )
    expect(handler.inputBuffer.length).toBe(0)
  })

  test('_resetMessageState resets state', () => {
    handler.messageInProgress = true
    handler.expectedMessageLength = 123
    handler._resetMessageState()
    expect(handler.messageInProgress).toBe(false)
    expect(handler.expectedMessageLength).toBe(0)
  })

  test('_resetBuffer resets buffer and state', () => {
    handler.inputBuffer = Buffer.from('abc')
    handler.messageInProgress = true
    handler._resetBuffer()
    expect(handler.inputBuffer.length).toBe(0)
    expect(handler.messageInProgress).toBe(false)
  })

  test('_parseAndEmitMessage emits message event for valid JSON', () => {
    const msg = { foo: 'bar' }
    const buf = Buffer.from(JSON.stringify(msg))
    const spy = jest.fn()
    handler.on('message', spy)
    handler._parseAndEmitMessage(buf)
    expect(spy).toHaveBeenCalledWith(msg)
  })

  test('_parseAndEmitMessage emits error for invalid JSON', () => {
    const buf = Buffer.from('not-json')
    const spy = jest.fn()
    handler.on('error', spy)
    handler._parseAndEmitMessage(buf)
    expect(spy).toHaveBeenCalledWith(expect.any(Error))
    expect(log).toHaveBeenCalledWith(
      'ERROR',
      expect.stringContaining('Failed to parse message')
    )
  })

  test('_handleParsedMessage emits unwrapped message if wrapped', () => {
    const wrappedMsg = { wrapped: true, payload: { foo: 'bar' } }
    const spy = jest.fn()
    handler.on('message', spy)
    handler._handleParsedMessage(wrappedMsg)
    expect(isWrappedMessage).toHaveBeenCalledWith(wrappedMsg)
    expect(unwrapMessage).toHaveBeenCalledWith(wrappedMsg)
    expect(spy).toHaveBeenCalledWith(wrappedMsg.payload)
  })

  test('_handleParsedMessage emits error if unwrap fails', () => {
    isWrappedMessage.mockReturnValue(true)
    unwrapMessage.mockReturnValue(undefined)
    const spy = jest.fn()
    handler.on('error', spy)
    handler._handleParsedMessage({ wrapped: true })
    expect(spy).toHaveBeenCalledWith(expect.any(Error))
  })

  test('_handleParsedMessage emits message if not wrapped', () => {
    isWrappedMessage.mockReturnValue(false)
    const spy = jest.fn()
    handler.on('message', spy)
    handler._handleParsedMessage({ foo: 'bar' })
    expect(spy).toHaveBeenCalledWith({ foo: 'bar' })
  })

  test('_processStandardMessage returns false if buffer too small', () => {
    handler.inputBuffer = Buffer.alloc(2)
    expect(handler._processStandardMessage()).toBe(false)
  })

  test('_processStandardMessage processes valid message', () => {
    const msg = { foo: 'bar' }
    const json = JSON.stringify(msg)
    const buf = Buffer.alloc(4 + Buffer.byteLength(json))
    buf.writeUInt32LE(Buffer.byteLength(json), 0)
    buf.write(json, 4)
    handler.inputBuffer = buf
    const spy = jest.fn()
    handler.on('message', spy)
    expect(handler._processStandardMessage()).toBe(true)
    expect(spy).toHaveBeenCalledWith(msg)
    expect(handler.inputBuffer.length).toBe(0)
  })

  test('handleIncomingChunk processes chunk', () => {
    const msg = { foo: 'bar' }
    const json = JSON.stringify(msg)
    const buf = Buffer.alloc(4 + Buffer.byteLength(json))
    buf.writeUInt32LE(Buffer.byteLength(json), 0)
    buf.write(json, 4)
    const spy = jest.fn()
    handler.on('message', spy)
    handler.handleIncomingChunk(buf)
    expect(spy).toHaveBeenCalledWith(msg)
  })

  test('processNextMessage uses robust parsing if enabled', () => {
    handler.useRobustParsing = true
    const spy = jest
      .spyOn(handler, 'processNextMessageRobust')
      .mockReturnValue(true)
    expect(handler.processNextMessage()).toBe(true)
    expect(spy).toHaveBeenCalled()
  })

  test('processNextMessage uses standard parsing if disabled', () => {
    handler.useRobustParsing = false
    const spy = jest
      .spyOn(handler, '_processStandardMessage')
      .mockReturnValue(true)
    expect(handler.processNextMessage()).toBe(true)
    expect(spy).toHaveBeenCalled()
  })

  describe('processNextMessageRobust', () => {
    beforeEach(() => {
      handler.useRobustParsing = true
    })

    test('returns false if buffer too small', () => {
      handler.inputBuffer = Buffer.alloc(2)
      expect(handler.processNextMessageRobust()).toBe(false)
    })

    test('parses and emits message from robust buffer', () => {
      const msg = { foo: 'bar' }
      const json = JSON.stringify(msg)
      const buf = Buffer.alloc(4 + Buffer.byteLength(json))
      buf.writeUInt32LE(Buffer.byteLength(json), 0)
      buf.write(json, 4)
      handler.inputBuffer = buf
      const spy = jest.fn()
      handler.on('message', spy)
      expect(handler.processNextMessageRobust()).toBe(true)
      expect(spy).toHaveBeenCalledWith(msg)
      expect(handler.inputBuffer.length).toBe(0)
    })

    test('clears buffer if too large without valid message', () => {
      handler.inputBuffer = Buffer.alloc(10001, 'a')
      expect(handler.processNextMessageRobust()).toBe(false)
      expect(handler.inputBuffer.length).toBe(0)
      expect(log).toHaveBeenCalledWith(
        'ERROR',
        expect.stringContaining('Buffer too large')
      )
    })
  })

  test('send writes wrapped message to stdout', () => {
    const msg = { foo: 'bar' }
    const fakeWrite = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => {})
    handler.send(msg)
    expect(wrapMessage).toHaveBeenCalledWith(msg)
    expect(fakeWrite).toHaveBeenCalledTimes(2)
    expect(log).toHaveBeenCalledWith(
      'DEBUG',
      expect.stringContaining('Sending message')
    )
    expect(log).toHaveBeenCalledWith('DEBUG', 'Message sent successfully')
    fakeWrite.mockRestore()
  })

  test('send emits error on failure', () => {
    wrapMessage.mockImplementation(() => {
      throw new Error('fail')
    })
    const spy = jest.fn()
    handler.on('error', spy)
    handler.send({ foo: 'bar' })
    expect(spy).toHaveBeenCalledWith(expect.any(Error))
    expect(log).toHaveBeenCalledWith(
      'ERROR',
      expect.stringContaining('Failed to send message')
    )
  })

  test('stop pauses stdin and clears buffer', () => {
    const pause = jest
      .spyOn(process.stdin, 'pause')
      .mockImplementation(() => {})
    const removeAllListeners = jest
      .spyOn(process.stdin, 'removeAllListeners')
      .mockImplementation(() => {})
    handler.inputBuffer = Buffer.from('abc')
    handler.stop()
    expect(pause).toHaveBeenCalled()
    expect(removeAllListeners).toHaveBeenCalled()
    expect(handler.inputBuffer.length).toBe(0)
    expect(log).toHaveBeenCalledWith('INFO', 'Native messaging handler stopped')
    pause.mockRestore()
    removeAllListeners.mockRestore()
  })

  // Minimal tests for overridden EventEmitter methods
  test('addListener returns undefined', () => {
    expect(handler.addListener('message', () => {})).toBeUndefined()
  })
  test('eventNames returns undefined', () => {
    expect(handler.eventNames()).toBeUndefined()
  })
  test('getMaxListeners returns 0', () => {
    expect(handler.getMaxListeners()).toBe(0)
  })
  test('listenerCount returns 0', () => {
    expect(handler.listenerCount('message')).toBe(0)
  })
  test('listeners returns undefined', () => {
    expect(handler.listeners('message')).toBeUndefined()
  })
  test('off returns undefined', () => {
    expect(handler.off('message', () => {})).toBeUndefined()
  })
  test('once returns undefined', () => {
    expect(handler.once('message', () => {})).toBeUndefined()
  })
  test('prependListener returns undefined', () => {
    expect(handler.prependListener('message', () => {})).toBeUndefined()
  })
  test('prependOnceListener returns undefined', () => {
    expect(handler.prependOnceListener('message', () => {})).toBeUndefined()
  })
  test('rawListeners returns undefined', () => {
    expect(handler.rawListeners('message')).toBeUndefined()
  })
  test('removeAllListeners returns undefined', () => {
    expect(handler.removeAllListeners('message')).toBeUndefined()
  })
  test('setMaxListeners returns undefined', () => {
    expect(handler.setMaxListeners(10)).toBeUndefined()
  })
})
