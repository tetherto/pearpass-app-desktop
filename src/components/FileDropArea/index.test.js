import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { FileDropArea } from './index'
import '@testing-library/jest-dom'

describe('FileDropArea component', () => {
  const mockOnFileDrop = jest.fn()
  const testLabel = 'Drop files here'

  const renderComponent = () =>
    render(
      <ThemeProvider>
        <FileDropArea label={testLabel} onFileDrop={mockOnFileDrop} />
      </ThemeProvider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders the label correctly', () => {
    const { getByText, container } = renderComponent()
    expect(getByText(testLabel)).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('triggers file input click when area is clicked', () => {
    const { getByText, container } = renderComponent()
    const dropArea = getByText(testLabel)
    const fileInput = container.querySelector('input[type="file"]')

    const mockClick = jest.spyOn(fileInput, 'click')
    fireEvent.click(dropArea)

    expect(mockClick).toHaveBeenCalled()
  })

  test('calls onFileDrop when files are selected via input', () => {
    const { container } = renderComponent()
    const fileInput = container.querySelector('input[type="file"]')

    const testFiles = [
      new File(['test content'], 'test.txt', { type: 'text/plain' })
    ]
    Object.defineProperty(fileInput, 'files', {
      value: testFiles
    })

    fireEvent.change(fileInput)
    expect(mockOnFileDrop).toHaveBeenCalledWith(testFiles)
  })

  test('handles file drop correctly', () => {
    const { getByText } = renderComponent()
    const dropArea = getByText(testLabel)

    const testFiles = [
      new File(['test content'], 'test.txt', { type: 'text/plain' })
    ]

    fireEvent.drop(dropArea, {
      dataTransfer: {
        files: testFiles
      }
    })

    expect(mockOnFileDrop).toHaveBeenCalledWith(testFiles)
  })
})
