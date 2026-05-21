import type { ThemeColors } from '@tetherto/pearpass-lib-ui-kit'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const createStyles = (colors: ThemeColors) => ({
  root: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'stretch' as const,
    gap: `${rawTokens.spacing8}px`,
    width: '100%',
    boxSizing: 'border-box' as const
  },

  settingCard: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: `${rawTokens.spacing12}px`,
    padding: `${rawTokens.spacing12}px`,
    borderRadius: `${rawTokens.radius8}px`,
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderColor: colors.colorBorderPrimary,
    boxSizing: 'border-box' as const,
    marginTop: `${rawTokens.spacing16}px`
  },

  toggleBlock: {
    width: '100%'
  },

  radioBlock: {
    width: '100%'
  },

  modeRadioGroup: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderColor: colors.colorBorderPrimary,
    borderRadius: `${rawTokens.radius8}px`,
    overflow: 'hidden' as const,
    boxSizing: 'border-box' as const
  },

  radioOptionPad: {
    padding: `${rawTokens.spacing12}px`,
    width: '100%',
    boxSizing: 'border-box' as const
  },

  manualOptionBlock: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    width: '100%',
    borderTopWidth: 1,
    borderTopStyle: 'solid' as const,
    borderTopColor: colors.colorBorderPrimary,
    boxSizing: 'border-box' as const
  },

  manualMultislotWrap: {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: `${rawTokens.spacing12}px`
  },

  multiSlotActions: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: '100%',
    boxSizing: 'border-box' as const
  },

  saveChangesRow: {
    display: 'flex' as const,
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    width: '100%',
    marginTop: `${rawTokens.spacing16}px`,
    boxSizing: 'border-box' as const
  }
})
