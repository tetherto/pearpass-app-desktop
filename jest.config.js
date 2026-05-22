export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.yalc/',
    '/packages/',
    '/e2e/',
    '/dist/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(htm|react-strict-dom|@tetherto/pearpass-lib-ui-react-components|@tetherto/pear-apps-lib-ui-react-hooks|@tetherto/pear-apps-utils-validator|@tetherto/pearpass-lib-vault|@tetherto/pearpass-lib-vault-core|@tetherto/pearpass-lib-ui-kit|@tetherto/pearpass-utils-password-check|@tetherto/pearpass-utils-password-generator|@tetherto/pear-apps-utils-pattern-search|@tetherto/pear-apps-utils-avatar-initials|@tetherto/pear-apps-lib-feedback|@tetherto/pear-apps-utils-generate-unique-id|@tetherto/pearpass-lib-constants|@tetherto/pear-apps-utils-date|@tetherto/pear-apps-utils-qr)/)'
  ],
  globals: {
    Pear: {
      config: { tier: 'dev' }
    }
  }
}
