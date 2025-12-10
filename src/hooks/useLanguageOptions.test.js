import { renderHook } from '@testing-library/react'

import { useLanguageOptions } from './useLanguageOptions'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: { _: (str) => str }
  })
}))

jest.mock('pearpass-lib-constants', () => ({
  LANGUAGES: [
    { value: 'en' },
    { value: 'it' },
    { value: 'es' },
    { value: 'fr' }
  ]
}))

describe('useLanguageOptions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should return language options with correct labels and values', () => {
    const { result } = renderHook(() => useLanguageOptions())

    expect(result.current.languageOptions).toEqual([
      { label: 'English', value: 'en' },
      { label: 'Italian', value: 'it' },
      { label: 'Spanish', value: 'es' },
      { label: 'French', value: 'fr' }
    ])
  })

  it('should memoize the language options', () => {
    const { result, rerender } = renderHook(() => useLanguageOptions())
    const firstResult = result.current.languageOptions

    rerender()

    expect(result.current.languageOptions).toStrictEqual(firstResult)
  })
})
