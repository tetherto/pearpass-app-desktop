import { isDev, isProd } from './envGetter'

describe('envGetter', () => {
  const originalNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('isDev returns true only when NODE_ENV=development', () => {
    process.env.NODE_ENV = 'development'
    expect(isDev()).toBe(true)

    process.env.NODE_ENV = 'production'
    expect(isDev()).toBe(false)

    process.env.NODE_ENV = 'test'
    expect(isDev()).toBe(false)

    delete process.env.NODE_ENV
    expect(isDev()).toBe(false)
  })

  it('isProd returns true only when NODE_ENV=production', () => {
    process.env.NODE_ENV = 'production'
    expect(isProd()).toBe(true)

    process.env.NODE_ENV = 'development'
    expect(isProd()).toBe(false)

    process.env.NODE_ENV = 'test'
    expect(isProd()).toBe(false)

    delete process.env.NODE_ENV
    expect(isProd()).toBe(false)
  })
})
