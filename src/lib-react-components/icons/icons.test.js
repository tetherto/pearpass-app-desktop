import fs from 'fs'
import path from 'path'

import React from 'react'

import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

const iconsDir = path.join(__dirname, '../icons')

function getIconModules(dir) {
  const modules = []
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      const indexPath = path.join(fullPath, 'index.js')
      if (fs.existsSync(indexPath)) {
        modules.push(indexPath)
      } else {
        modules.push(...getIconModules(fullPath))
      }
    }
  })
  return modules
}

const iconModulePaths = getIconModules(iconsDir)
const icons = []

iconModulePaths.forEach((modulePath) => {
  const moduleExports = require(modulePath)

  Object.keys(moduleExports).forEach((exportName) => {
    if (exportName !== '__esModule') {
      icons.push({ name: exportName, Component: moduleExports[exportName] })
    }
  })
})

const originalConsoleError = console.error // eslint-disable-line no-console

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
    if (
      typeof message === 'string' &&
      message.includes('Each child in a list should have a unique "key" prop')
    ) {
      return
    }
    originalConsoleError(message, ...args)
  })
})

afterEach(() => {
  console.error.mockRestore() // eslint-disable-line no-console
})

describe('Icon Components', () => {
  icons.forEach(({ name, Component }, index) => {
    test(`${name} renders correctly`, () => {
      const { container } = render(
        <Component key={index} size="24px" color="#000" />
      )

      const svg = container.querySelector('svg')

      expect(svg).toBeInTheDocument()
      expect(svg.getAttribute('width')).toBe('24px')
      expect(svg.getAttribute('height')).toBe('24px')

      const elements = container.querySelectorAll('path, rect')

      expect(elements.length).toBeGreaterThan(0)

      const appliedColors = Array.from(elements).map(
        (el) => el.getAttribute('stroke') || el.getAttribute('fill')
      )

      if (!['OkayIcon', 'YellowErrorIcon', 'ErrorIcon'].includes(name)) {
        expect(appliedColors).toContain('#000')
      }

      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
