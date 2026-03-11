#!/usr/bin/env node
/* eslint-disable no-underscore-dangle */
/**
 * Bundle the vault worklet (ESM) to CommonJS for the packaged app so Bare can run it.
 * Only worklet source is bundled; all node_modules are external so Bare resolves them at runtime
 */
import path from 'path'
import { fileURLToPath } from 'url'

import * as esbuild from 'esbuild'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const workletDir = path.join(
  root,
  'node_modules',
  'pearpass-lib-vault-core',
  'src',
  'worklet'
)

/** Externalize any package (non-relative specifier) so node_modules are never inlined. */
const externalizeNodeModules = {
  name: 'externalize-node-modules',
  setup(build) {
    build.onResolve({ filter: /^[^./]/ }, (args) => {
      // Skip Windows absolute paths (e.g. C:\, F:\)
      if (/^[A-Za-z]:[/\\]/.test(args.path)) return null
      return { path: args.path, external: true }
    })
  }
}

async function buildWorklet() {
  await esbuild.build({
    entryPoints: [path.join(workletDir, 'app.js')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node18',
    outfile: path.join(workletDir, 'app.cjs'),
    plugins: [externalizeNodeModules],
    alias: {
      fs: 'bare-fs',
      path: 'bare-path',
      buffer: 'bare-buffer',
      crypto: 'bare-crypto',
      os: 'bare-os'
    },
    logLevel: 'info'
  })
}

buildWorklet()
