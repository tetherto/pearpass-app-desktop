const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')
const appName = pkg.productName ?? pkg.name
const { isWindows } = require('which-runtime')

function getWindowsKitVersion () {
  const programFiles = process.env['PROGRAMFILES(X86)'] || process.env.PROGRAMFILES
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

let packagerConfig = {
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
        appManifest: path.join(__dirname, 'build-assets', 'win', 'AppxManifest.xml'),
        packageAssets: path.join(__dirname, 'build-assets', 'icon'),
        windowsKitVersion: getWindowsKitVersion(),
        manifestVariables: {
          publisher: 'CN=&quot;Tether Operations, SA de CV&quot;, O=&quot;Tether Operations, SA de CV&quot;, L=San Salvador, C=SV, SERIALNUMBER=2025120324, OID.2.5.4.15=Private Organization, OID.1.3.6.1.4.1.311.60.2.1.3=SV'
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
    preMake: async () => {
      fs.rmSync(path.join(__dirname, 'out', 'make'), { recursive: true, force: true })

      const pkgJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))
      const [major, minor, patch] = pkgJson.version.split('-')[0].split('.').map(Number)
      const msixVersion = `${major}.${minor}.${patch}.0`
      const manifestPath = path.resolve('build-assets/win/AppxManifest.xml')
      const manifest = fs.readFileSync(manifestPath, 'utf8')
      fs.writeFileSync(
        manifestPath,
        manifest.replace(/Version="\d+\.\d+\.\d+\.\d+"/, `Version="${msixVersion}"`)
      )
    },
    postMake: async (forgeConfig, results) => {
      for (const result of results) {
        if (result.platform !== 'win32') continue
        for (const artifact of result.artifacts) {
          if (!artifact.endsWith('.msix')) continue
          // Place Windows artifact in a stable path for pear-build:
          // ./out/PearPass (directory name must match appName)
          const standardDir = path.join(__dirname, 'out', appName)
          fs.mkdirSync(standardDir, { recursive: true })
          const dest = path.join(standardDir, path.basename(artifact))
          fs.renameSync(artifact, dest)
          result.artifacts[result.artifacts.indexOf(artifact)] = dest
        }
      }
      if (isWindows) {
        fs.rmSync(path.join(__dirname, 'out', 'make'), { recursive: true, force: true })
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

