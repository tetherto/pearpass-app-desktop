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
  color = '#F6F6F6',
  fill = false
}) => ({
  size: size,
  height: height || size,
  width: width || size,
  color: color,
  fill
})
