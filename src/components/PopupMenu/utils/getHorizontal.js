/**
 * @param {'left' | 'right' | 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'} direction
 * @returns {'left' | 'right' | ''}
 */
export const getHorizontal = (direction) => {
  if (direction?.toLowerCase().includes('left')) {
    return 'left'
  }
  if (direction?.toLowerCase().includes('right')) {
    return 'right'
  }
  return ''
}
