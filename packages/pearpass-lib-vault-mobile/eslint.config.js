import { eslintConfig } from 'tether-dev-docs'

export default [
  ...eslintConfig,
  {
    languageOptions: {
      globals: {
        BareKit: 'readonly'
      }
    },
    rules: {
      'no-underscore-dangle': 'off'
    },
    ignores: ['dist']
  }
]
