export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '^pearpass-lib-ui-theme-provider$':
      '<rootDir>/node_modules/pearpass-lib-ui-theme-provider/src/index.js'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.yalc/', '/packages/', '/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!(htm|pearpass-lib-ui-theme-provider|pearpass-lib-ui-react-components|pear-apps-lib-ui-react-hooks|pear-apps-utils-validator|pearpass-lib-vault|pearpass-utils-password-check|pearpass-utils-password-generator|pear-apps-utils-pattern-search|pear-apps-utils-avatar-initials|pear-apps-lib-feedback|pear-apps-utils-generate-unique-id|pearpass-lib-constants)/)'
  ],
  globals: {
    Pear: {
      config: { tier: 'dev' }
    }
  }
}
