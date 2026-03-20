#!/usr/bin/env node
/**
 * Bundle the native messaging bridge into a single CJS file for Electron (ELECTRON_RUN_AS_NODE).
 * Node built-ins and pear-ipc are external: they resolve at runtime.
 */
import * as esbuild from 'esbuild'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

esbuild.build({
  entryPoints: [
    path.join(
      root,
      'node_modules',
      '@tetherto',
      'pearpass-lib-native-messaging-bridge',
      'index.js'
    )
  ],
  bundle: true,
  outfile: path.join(root, 'dist', 'native-messaging-bridge.bundle.cjs'),
  platform: 'node',
  target: ['node18'],
  format: 'cjs',
  external: [
    'fs',
    'fs/promises',
    'path',
    'os',
    'net',
    'events',
    'crypto',
    'child_process',
    'pear-ipc'
  ],
  logLevel: 'info'
}).catch(() => process.exit(1))
