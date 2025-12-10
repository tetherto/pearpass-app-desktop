import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../..')

export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.yalc/'],
  transformIgnorePatterns: [
    'node_modules/(?!(pear-apps-utils-validator|pear-apps-utils-pattern-search)/)'
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^react$': path.join(rootDir, 'node_modules/react'),
    '^react-dom$': path.join(rootDir, 'node_modules/react-dom'),
    '^react-dom/(.*)$': path.join(rootDir, 'node_modules/react-dom/$1')
  }
}
