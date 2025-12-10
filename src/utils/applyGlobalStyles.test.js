import { applyGlobalStyles } from './applyGlobalStyles'

describe('applyGlobalStyles', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  test('should add a style element to document head', () => {
    applyGlobalStyles('body { color: red; }')

    const styleElements = document.head.getElementsByTagName('style')
    expect(styleElements.length).toBe(1)
  })

  test('should set the provided styles as innerHTML of the style element', () => {
    const testStyles = 'body { color: blue; }'
    applyGlobalStyles(testStyles)

    const styleElement = document.head.getElementsByTagName('style')[0]
    expect(styleElement.innerHTML).toBe(testStyles)
  })

  test('should append multiple style elements when called multiple times', () => {
    applyGlobalStyles('body { color: red; }')
    applyGlobalStyles('div { margin: 0; }')

    const styleElements = document.head.getElementsByTagName('style')
    expect(styleElements.length).toBe(2)
  })
})
