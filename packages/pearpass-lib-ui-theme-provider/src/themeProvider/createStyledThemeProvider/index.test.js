import { createStyledThemeProvider } from './index'
import { colors } from '../../colors'

describe('createStyledThemeProvider', () => {
  it('should pass the theme and extra props to the StyledThemeProvider', () => {
    const DummyStyledThemeProvider = jest.fn((props) => props)
    const extraProps = { foo: 'bar', baz: 42 }

    const result = createStyledThemeProvider(
      DummyStyledThemeProvider,
      extraProps
    )

    expect(DummyStyledThemeProvider).toHaveBeenCalledWith({
      theme: { colors },
      ...extraProps
    })
    expect(result).toEqual({ theme: { colors }, ...extraProps })
  })

  it('should work correctly with no extra props', () => {
    const DummyStyledThemeProvider = jest.fn((props) => props)

    const result = createStyledThemeProvider(DummyStyledThemeProvider, {})

    expect(DummyStyledThemeProvider).toHaveBeenCalledWith({ theme: { colors } })
    expect(result).toEqual({ theme: { colors } })
  })
})
