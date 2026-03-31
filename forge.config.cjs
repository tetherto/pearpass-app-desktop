const fs = require('fs')
const path = require('path')

const { isWindows } = require('which-runtime')

const pkg = require('./package.json')

const appName = pkg.productName ?? pkg.name

function getWindowsKitVersion() {
  const programFiles =
    process.env['PROGRAMFILES(X86)'] || process.env.PROGRAMFILES
  if (!programFiles) return undefined
  const kitsDir = path.join(programFiles, 'Windows Kits')
  try {
    for (const kit of fs.readdirSync(kitsDir).sort().reverse()) {
      const binDir = path.join(kitsDir, kit, 'bin')
      if (!fs.existsSync(binDir)) continue
      const version = fs
        .readdirSync(binDir)
        .filter((d) => /^\d+\.\d+\.\d+\.\d+$/.test(d))
        .sort()
        .pop()
      if (version) return version
    }
  } catch {
    return undefined
  }
}

const packagerConfig = {
  icon: path.join(__dirname, 'assets', 'win32', 'icon'),
  protocols: [{ name: appName, schemes: [pkg.name] }],
  derefSymlinks: true
}

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  packagerConfig,

  makers: [
    {
      name: '@electron-forge/maker-msix',
      config: {
        appManifest: path.join(
          __dirname,
          'build-assets',
          'win',
          'AppxManifest.xml'
        ),
        packageAssets: path.join(__dirname, 'build-assets', 'icon'),
        createPri: false,
        windowsKitVersion: getWindowsKitVersion(),
        manifestVariables: {
          publisher:
            'CN=&quot;Tether Operations, SA de CV&quot;, O=&quot;Tether Operations, SA de CV&quot;, L=San Salvador, C=SV, SERIALNUMBER=2025120324, OID.2.5.4.15=Private Organization, OID.1.3.6.1.4.1.311.60.2.1.3=SV'
        },
        windowsSignOptions: {
          certificateSha1: '874b95fdc8a490a3d3bab28643902948b2c7ad43',
          signWithParams: '/sha1 874b95fdc8a490a3d3bab28643902948b2c7ad43',
          timestampServer: 'http://timestamp.digicert.com',
          fileDigestAlgorithm: 'sha256',
          timestampDigestAlgorithm: 'sha256'
        }
      }
    }
  ],

  hooks: {
    preMake: async (_config, options) => {
      const targetArch = options?.arch || process.arch
      const msixArch = targetArch === 'arm64' ? 'arm64' : 'x64'

      const pkgJson = JSON.parse(
        fs.readFileSync(path.resolve('package.json'), 'utf8')
      )
      const [major, minor, patch] = pkgJson.version
        .split('-')[0]
        .split('.')
        .map(Number)
      const msixVersion = `${major}.${minor}.${patch}.0`
      const manifestPath = path.resolve('build-assets/win/AppxManifest.xml')
      const manifest = fs.readFileSync(manifestPath, 'utf8')
      fs.writeFileSync(
        manifestPath,
        manifest
          .replace(
            /Version="\d+\.\d+\.\d+\.\d+"/,
            `Version="${msixVersion}"`
          )
          .replace(
            /ProcessorArchitecture="\w+"/,
            `ProcessorArchitecture="${msixArch}"`
          )
      )
    },
    postMake: async (forgeConfig, results) => {
      for (const result of results) {
        if (result.platform !== 'win32') continue
        for (let i = 0; i < result.artifacts.length; i++) {
          const artifact = result.artifacts[i]
          if (!artifact.endsWith('.msix')) continue
          const dir = path.dirname(artifact)
          const ext = path.extname(artifact)
          const base = path.basename(artifact, ext)
          const renamed = path.join(dir, `${base}-${result.arch}${ext}`)
          fs.renameSync(artifact, renamed)
          result.artifacts[i] = renamed
        }
      }
    }
  },

  plugins: [
    {
      name: 'electron-forge-plugin-universal-prebuilds',
      config: {}
    },
    {
      name: 'electron-forge-plugin-prune-prebuilds',
      config: {}
    }
  ]
}
