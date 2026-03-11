#!/usr/bin/env node
/**
 * Bundle the renderer (app.electron.tsx + deps) into a single file for Electron.
 * Node built-ins are external: they resolve at runtime in the renderer (nodeIntegration: true).
 */
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const watch = process.argv.includes('--watch')

const ctx = await esbuild.context({
  entryPoints: [path.join(root, 'app.electron.tsx')],
  bundle: true,
  outfile: path.join(root, 'dist', 'renderer.bundle.js'),
  platform: 'browser',
  target: ['es2020'],
  format: 'iife',
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    )
  },
  loader: {
    '.js': 'jsx',
    '.mjs': 'js'
  },
  jsx: 'automatic',
  alias: {
    react: path.join(root, 'node_modules', 'react'),
    'react-dom': path.join(root, 'node_modules', 'react-dom')
  },
  external: [
    'fs',
    'path',
    'os',
    'net',
    'crypto',
    'child_process',
    'fs/promises',
    'require-addon',
    'fs-native-extensions',
    'sodium-native',
    'crypto'
  ],
  logLevel: 'info'
})

if (watch) {
  await ctx.watch()
  console.log('Watching for changes...')
} else {
  await ctx.rebuild()
  ctx.dispose()
}
