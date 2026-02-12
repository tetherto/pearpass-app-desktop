import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { RecordAvatar } from './index'
import '@testing-library/jest-dom'

jest.mock('../../lib-react-components', () => ({
  CheckIcon: (props) => <svg data-testid="check-icon" {...props} />,
  StarIcon: (props) => <svg data-testid="star-icon" {...props} />
}))

const mockUseFavicon = jest.fn()
jest.mock('pearpass-lib-vault', () => ({
  ...jest.requireActual('pearpass-lib-vault'),
  useFavicon: (params) => mockUseFavicon(params)
}))

describe('RecordAvatar Component', () => {
  const defaultProps = {
    initials: 'AB',
    color: '#FF5500'
  }

  beforeEach(() => {
    mockUseFavicon.mockReset()
    mockUseFavicon.mockReturnValue({
      faviconSrc: null,
      isLoading: false,
      hasError: false
    })
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url')
  })

  test('calls useFavicon with domain', () => {
    render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} websiteDomain="https://example.com" />
      </ThemeProvider>
    )

    expect(mockUseFavicon).toHaveBeenCalledWith({ url: 'https://example.com' })
  })

  test('calls useFavicon with undefined when no websiteDomain', () => {
    render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} />
      </ThemeProvider>
    )

    expect(mockUseFavicon).toHaveBeenCalledWith({ url: undefined })
  })

  test('renders image when useFavicon returns faviconSrc', () => {
    mockUseFavicon.mockReturnValue({
      faviconSrc: 'blob:test-url',
      isLoading: false,
      hasError: false
    })

    const { container } = render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} websiteDomain="https://test.com" />
      </ThemeProvider>
    )

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'blob:test-url')
  })

  test('renders initials fallback if favicon returns null', () => {
    const { getByText } = render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} websiteDomain="https://test.com" />
      </ThemeProvider>
    )

    expect(getByText('AB')).toBeInTheDocument()
  })

  test('renders check icon instead of favorite when both isSelected and isFavorite are true', () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider>
        <RecordAvatar {...defaultProps} isSelected={true} isFavorite={true} />
      </ThemeProvider>
    )

    expect(getByTestId('check-icon')).toBeInTheDocument()
    expect(queryByTestId('star-icon')).not.toBeInTheDocument()
  })
})
