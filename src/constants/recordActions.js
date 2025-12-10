import {
  CheckIcon,
  MoveToIcon,
  DeleteIcon,
  StarIcon
} from '../lib-react-components'

/**
 * @type {Record<string, import('react').ElementType>}
 */
export const RECORD_ACTION_ICON_BY_TYPE = {
  select: CheckIcon,
  favorite: StarIcon,
  move: MoveToIcon,
  delete: DeleteIcon
}
