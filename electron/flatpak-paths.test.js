const {
  getFlatpakCompatRoots,
  getSandboxSafePath,
  isFlatpakRuntime,
  mapFlatpakPathToSandbox
} = require('./flatpak-paths.cjs')

describe('flatpak path helpers', () => {
  const env = {
    HOME: '/home/alvaro',
    XDG_CONFIG_HOME: '/home/alvaro/.var/app/com.pears.pass/config',
    XDG_DATA_HOME: '/home/alvaro/.var/app/com.pears.pass/data',
    XDG_CACHE_HOME: '/home/alvaro/.var/app/com.pears.pass/cache'
  }

  it('detects flatpak via FLATPAK_ID', () => {
    expect(isFlatpakRuntime({ env: { FLATPAK_ID: 'com.pears.pass' } })).toBe(true)
  })

  it('derives flatpak compatibility roots under the user config directory', () => {
    expect(getFlatpakCompatRoots({ env })).toEqual({
      config: '/home/alvaro/.config',
      data: '/home/alvaro/.config/pearpass-flatpak-data',
      cache: '/home/alvaro/.config/pearpass-flatpak-cache'
    })
  })

  it('maps host-side flatpak config paths into sandbox-safe paths', () => {
    expect(
      mapFlatpakPathToSandbox('/home/alvaro/.var/app/com.pears.pass/config/PearPass', { env })
    ).toBe('/home/alvaro/.config/PearPass')
  })

  it('returns sandbox-safe path only when running inside flatpak', () => {
    const targetPath = '/home/alvaro/.var/app/com.pears.pass/data/PearPass'

    expect(
      getSandboxSafePath(targetPath, { env: { ...env, FLATPAK_ID: 'com.pears.pass' } })
    ).toBe('/home/alvaro/.config/pearpass-flatpak-data/PearPass')
    expect(getSandboxSafePath(targetPath, { env, existsSync: () => false })).toBe(targetPath)
  })
})
