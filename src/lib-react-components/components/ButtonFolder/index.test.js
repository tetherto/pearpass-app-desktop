import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { ButtonFolder } from './index'
import '@testing-library/jest-dom'

describe('ButtonFolder Component', () => {
  test('renders correctly with children and onClick handler', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <ThemeProvider>
        <ButtonFolder onClick={handleClick}>Open Folder</ButtonFolder>
      </ThemeProvider>
    )

    const buttonText = getByText('Open Folder')
    expect(buttonText).toBeInTheDocument()

    fireEvent.click(buttonText)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders FolderIcon with correct size', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonFolder onClick={handleClick}>Open Folder</ButtonFolder>
      </ThemeProvider>
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg.getAttribute('width')).toBe('21')
    expect(svg.getAttribute('height')).toBe('21')
  })

  test('matches snapshot', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <ThemeProvider>
        <ButtonFolder onClick={handleClick}>Snapshot Folder</ButtonFolder>
      </ThemeProvider>
    )

    expect(container.firstChild).toMatchSnapshot()
  })
})
