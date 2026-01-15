import { eslintConfig } from 'tether-dev-docs'

export default [
  ...eslintConfig,
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^React$',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^React$',
          ignoreRestSiblings: true
        }
      ]
    }
  }
]
