export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs'
      }
    ],
    '@babel/preset-react',
    'module:@react-native/babel-preset'
  ]
}
