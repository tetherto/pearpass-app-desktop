const mockRun = jest.fn()

jest.mock('pear-run', () => mockRun)

describe('createOrGetPipe', () => {
  let mockPipe
  let teardownCallback

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    mockPipe = { end: jest.fn() }
    mockRun.mockReturnValue(mockPipe)

    global.Pear = {
      teardown: jest.fn((callback) => {
        teardownCallback = callback
      }),
      config: {
        key: 'test-key',
        applink: 'https://example.com'
      }
    }
  })

  afterEach(() => {
    delete global.Pear
  })

  it('creates a new pipe when none exists', () => {
    const { createOrGetPipe } = require('./createOrGetPipe')
    const pipe = createOrGetPipe()

    expect(mockRun).toHaveBeenCalledWith(
      'https://example.com/node_modules/pearpass-lib-vault-mobile/src/worklet/app.js'
    )
    expect(pipe).toBe(mockPipe)
  })

  it('returns the existing pipe on subsequent calls', () => {
    const { createOrGetPipe } = require('./createOrGetPipe')
    const first = createOrGetPipe()
    const second = createOrGetPipe()

    expect(mockRun).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
  })

  it('registers and invokes teardown callback, ending and resetting the pipe', () => {
    const { createOrGetPipe } = require('./createOrGetPipe')
    createOrGetPipe()

    teardownCallback()

    expect(mockPipe.end).toHaveBeenCalled()

    const recreated = createOrGetPipe()
    expect(mockRun).toHaveBeenCalledTimes(2)
    expect(recreated).toBe(mockPipe)
  })
})
