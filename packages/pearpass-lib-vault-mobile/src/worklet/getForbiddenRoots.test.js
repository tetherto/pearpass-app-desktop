const { getForbiddenRoots } = require('./getForbiddenRoots')

describe('getForbiddenRoots', () => {
  let originalBare

  beforeAll(() => {
    // Save original global Bare if it exists
    if (typeof global.Bare !== 'undefined') {
      originalBare = global.Bare
    }
  })

  afterAll(() => {
    // Restore original global Bare
    if (originalBare) {
      global.Bare = originalBare
    } else {
      delete global.Bare
    }
  })

  test('returns Windows paths when platform is win32', () => {
    global.Bare = { platform: 'win32' }
    const roots = getForbiddenRoots()

    expect(roots).toContain('C:\\Windows')
    expect(roots).toContain('C:\\Program Files')
    expect(roots).not.toContain('/bin')
    expect(roots.some((r) => r.startsWith('/'))).toBe(false)
  })

  test('returns macOS paths when platform is darwin', () => {
    global.Bare = { platform: 'darwin' }
    const roots = getForbiddenRoots()

    expect(roots).toContain('/System')
    expect(roots).toContain('/Library')
    expect(roots).toContain('/private')
    expect(roots).not.toContain('C:\\Windows')
    expect(roots).not.toContain('/lib64') // Linux specific
  })

  test('returns Linux/Unix paths when platform is linux', () => {
    global.Bare = { platform: 'linux' }
    const roots = getForbiddenRoots()

    expect(roots).toContain('/bin')
    expect(roots).toContain('/lib64')
    expect(roots).not.toContain('/System') // Mac specific
    expect(roots).not.toContain('C:\\Windows')
  })

  test('returns Linux/Unix paths as default fallback for unknown platforms', () => {
    global.Bare = { platform: 'android' }
    const roots = getForbiddenRoots()

    expect(roots).toContain('/bin')
    expect(roots).toContain('/etc')
  })
})
