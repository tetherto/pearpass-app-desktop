import { colors } from 'pearpass-lib-ui-theme-provider'

import { getIconProps } from './getIconProps'

jest.mock('pearpass-lib-ui-theme-provider', () => ({
  colors: {
    white: {
      mode1: '#FFFFFF'
    }
  }
}))

describe('getIconProps', () => {
  it('should return default values when no props are provided', () => {
    const result = getIconProps({})

    expect(result).toEqual({
      fill: false,
      size: '24',
      height: '24',
      width: '24',
      color: colors.white.mode1
    })
  })

  it('should use custom size for all dimensions when only size is provided', () => {
    const result = getIconProps({ size: '24' })

    expect(result).toEqual({
      fill: false,
      size: '24',
      height: '24',
      width: '24',
      color: colors.white.mode1
    })
  })

  it('should use custom height when provided', () => {
    const result = getIconProps({ height: '32' })

    expect(result).toEqual({
      fill: false,
      size: '24',
      height: '32',
      width: '24',
      color: colors.white.mode1
    })
  })

  it('should use custom width when provided', () => {
    const result = getIconProps({ width: '32' })

    expect(result).toEqual({
      fill: false,
      size: '24',
      height: '24',
      width: '32',
      color: colors.white.mode1
    })
  })

  it('should use custom color when provided', () => {
    const result = getIconProps({ color: '#000000' })

    expect(result).toEqual({
      fill: false,
      size: '24',
      height: '24',
      width: '24',
      color: '#000000'
    })
  })

  it('should handle all custom props together', () => {
    const result = getIconProps({
      fill: false,
      size: '24',
      height: '32',
      width: '48',
      color: '#FF0000'
    })

    expect(result).toEqual({
      fill: false,
      size: '24',
      height: '32',
      width: '48',
      color: '#FF0000'
    })
  })
})
