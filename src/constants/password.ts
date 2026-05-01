import { PasswordIndicatorVariant } from '@tetherto/pearpass-lib-ui-kit'

const STRENGTH_MAP: Record<string, PasswordIndicatorVariant> = {
  error: 'vulnerable',
  warning: 'decent',
  success: 'strong'
}

export { STRENGTH_MAP }
