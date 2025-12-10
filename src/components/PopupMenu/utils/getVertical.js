/**
 * @param {'top' | 'bottom' | 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'} direction
 * @returns {'top' | 'bottom' | ''}
 */
export const getVertical = (direction) => {
  if (direction?.includes('top')) {
    return 'top'
  }
  if (direction?.includes('bottom')) {
    return 'bottom'
  }
  return ''
}
