import { defineConfig } from '@lingui/cli'
import { formatter } from '@lingui/format-json'

export default defineConfig({
  locales: ['en'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: './src/locales/{locale}/messages',
      include: ['./src'],
      exclude: ['./src/native-messaging-bridge/node_modules/**']
    }
  ],
  format: formatter({ style: 'minimal' }),
  compileNamespace: 'es'
})
