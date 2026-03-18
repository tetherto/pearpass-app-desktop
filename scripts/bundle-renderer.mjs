#!/usr/bin/env node
/**
 * Bundle the renderer (app.electron.tsx + deps) into a single file for Electron.
 * Node built-ins are external: they resolve at runtime in the renderer (nodeIntegration: true).
 */
import * as esbuild from 'esbuild'
import { readFile } from 'fs/promises'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const watch = process.argv.includes('--watch')
const require = createRequire(import.meta.url)
const postcss = require('postcss')
const babel = require('@babel/core')
const fg = require('fast-glob')
const reactStrictDomPostcssPlugin = require('react-strict-dom/postcss-plugin')
const strictDomBabelConfig = require(path.join(root, 'babel.strict-dom.cjs'))
const strictDomCssInclude = [
  'app.electron.tsx',
  'src/**/*.{js,jsx,mjs,ts,tsx}',
  'node_modules/@tetherto/pearpass-lib-ui-kit/dist/**/*.js'
]
const strictDomRuntimePaths = [
  `${path.sep}node_modules${path.sep}react-strict-dom${path.sep}dist${path.sep}`,
  `${path.sep}node_modules${path.sep}@tetherto${path.sep}pearpass-lib-ui-kit${path.sep}dist${path.sep}`
]

function shouldTransformStrictDomRuntime(filePath) {
  return strictDomRuntimePaths.some((runtimePath) => filePath.includes(runtimePath))
}

function getLoader(filePath) {
  if (filePath.endsWith('.tsx')) return 'tsx'
  if (filePath.endsWith('.ts')) return 'ts'
  if (filePath.endsWith('.jsx')) return 'jsx'
  return 'js'
}

function strictDomBabelPlugin() {
  return {
    name: 'strict-dom-babel',
    setup(build) {
      build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async (args) => {
        if (!shouldTransformStrictDomRuntime(args.path)) return null

        const source = await readFile(args.path, 'utf8')
        const transformed = await babel.transformAsync(source, {
          filename: args.path,
          sourceMaps: true,
          ...strictDomBabelConfig
        })

        return {
          contents: transformed?.code ?? source,
          loader: getLoader(args.path),
          resolveDir: path.dirname(args.path)
        }
      })
    }
  }
}

function strictDomCssPlugin() {
  return {
    name: 'strict-dom-css',
    setup(build) {
      build.onLoad({ filter: /strict\.css$/ }, async (args) => {
        const source = await readFile(args.path, 'utf8')
        const watchFiles = fg.sync(strictDomCssInclude, {
          cwd: root,
          absolute: true,
          onlyFiles: true,
          dot: false
        })
        const result = await postcss([
          reactStrictDomPostcssPlugin({
            cwd: root,
            include: strictDomCssInclude,
            babelConfig: strictDomBabelConfig,
            useCSSLayers: true
          })
        ]).process(source, { from: args.path })

        return {
          contents: result.css,
          loader: 'css',
          resolveDir: path.dirname(args.path),
          watchFiles
        }
      })
    }
  }
}

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
  resolveExtensions: [
    '.web.mjs',
    '.web.js',
    '.web.mts',
    '.web.ts',
    '.web.jsx',
    '.web.tsx',
    '.mjs',
    '.js',
    '.mts',
    '.ts',
    '.jsx',
    '.tsx',
    '.css',
    '.json'
  ],
  plugins: [strictDomBabelPlugin(), strictDomCssPlugin()],
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
