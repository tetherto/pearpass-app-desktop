const dev = process.env.NODE_ENV !== 'production'

module.exports = {
  babelrc: false,
  configFile: false,
  parserOpts: {
    plugins: ['typescript', 'jsx']
  },
  presets: [
    [
      'react-strict-dom/babel-preset',
      {
        debug: dev,
        dev,
        rootDir: process.cwd(),
        platform: 'web'
      }
    ]
  ]
}
