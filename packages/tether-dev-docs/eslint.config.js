import { createRequire } from 'module'

import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPlugin from 'eslint-plugin-eslint-plugin'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import globals from 'globals'

const requireFromConsumer = createRequire(import.meta.url)

let tseslintParser
let tseslintPlugin

try {
  tseslintParser = requireFromConsumer('@typescript-eslint/parser')
  tseslintPlugin = requireFromConsumer('@typescript-eslint/eslint-plugin')
} catch {
  // TypeScript ESLint plugin not found — skipping TS config
}

export default [
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        Pear: 'readonly'
      }
    },
    plugins: {
      prettier: eslintPluginPrettier,
      import: eslintPluginImport,
      react: eslintPluginReact,
      eslint: eslintPlugin
    },
    rules: {
      ...eslintConfigPrettier.rules,

      // Prettier integration
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          useTabs: false,
          tabWidth: 2,
          trailingComma: 'none',
          bracketSpacing: true,
          arrowParens: 'always',
          endOfLine: 'auto',
          embeddedLanguageFormatting: 'auto'
        }
      ],

      // StandardJS style
      'prefer-const': 'error',
      'no-var': 'error',
      'no-tabs': 'error',

      // Private/protected methods
      'no-underscore-dangle': ['error', { allowAfterThis: true }],

      // Add null checks or use optional chaining
      'no-unsafe-optional-chaining': 'error',
      eqeqeq: ['error', 'always'],

      // Miscellaneous rules
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',

      // Import sorting rule
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type'
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          },
          'newlines-between': 'always'
        }
      ],

      // React rules
      'react/jsx-uses-vars': 'error',

      // Arrow functions
      'arrow-body-style': ['error', 'as-needed']
    }
  },

  ...(tseslintParser
    ? [
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: {
            parser: tseslintParser,
            parserOptions: {
              ecmaVersion: 2021,
              sourceType: 'module',
              ecmaFeatures: { jsx: true }
            }
          },
          plugins: { '@typescript-eslint': tseslintPlugin },
          rules: {
            'no-undef': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
              'error',
              { argsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/no-explicit-any': 'warn'
          }
        }
      ]
    : [])
]
