import { colors } from 'pearpass-lib-ui-theme-provider'

/**
 * @param {{
 *  size?: string;
 *  width?: string;
 *  height?: string;
 *  color?: string;
 * }} props
 *
 * @returns {{
 *  size: string;
 *  height: string;
 *  width: string;
 *  color: string;
 * }}
 */
export const getIconProps = ({
  size = '24',
  height,
  width,
  color = colors.white.mode1,
  fill = false
}) => ({
  size: size,
  height: height || size,
  width: width || size,
  color: color,
  fill
})
