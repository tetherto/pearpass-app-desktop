import {
  Button,
  ContextMenu,
  ListItem,
  NavbarListItem,
  PageHeader,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  MoreVert,
  PublicOutlined,
  SwapVert
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { useConnectExtension } from '../../../../hooks/useConnectExtension'
import { useTranslation } from '../../../../hooks/useTranslation'
import { createStyles } from './styles'

const TEST_IDS = {
  root: 'settings-your-devices',
  extensionSection: 'settings-card-browser-extension-connections',
  extensionActionButton: 'settings-browser-extension-action'
} as const

export const YourDevicesContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { isBrowserExtensionEnabled, toggleBrowserExtension } =
    useConnectExtension()

  return (
    <div data-testid={TEST_IDS.root} style={styles.root}>
      <PageHeader
        as="h1"
        title={t('Your Devices')}
        subtitle={t(
          'Devices listed here stay in sync. Changes made on one device update across all your vaults on every synced device.'
        )}
      />

      <div style={styles.sectionHeading}>
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t('Browser Extension Connections')}
        </Text>
      </div>

      <div data-testid={TEST_IDS.extensionSection} style={styles.sectionCard}>
        {isBrowserExtensionEnabled ? (
          <div style={styles.list}>
            <div>
              <ListItem
                icon={
                  <div style={styles.iconWrap}>
                    <PublicOutlined
                      width={16}
                      height={16}
                      color={theme.colors.colorTextPrimary}
                    />
                  </div>
                }
                title={'Browser'}
                testID="settings-device-item-browser"
                rightElement={
                  <ContextMenu
                    trigger={
                      <Button
                        variant="tertiary"
                        size="small"
                        iconBefore={
                          <MoreVert
                            width={16}
                            height={16}
                            color={theme.colors.colorTextPrimary}
                          />
                        }
                        data-testid={TEST_IDS.extensionActionButton}
                        aria-label={t('Browser extension actions')}
                      />
                    }
                  >
                    <NavbarListItem
                      label={t('Unpair Browser extension')}
                      variant="destructive"
                      onClick={() => toggleBrowserExtension(false)}
                    />
                  </ContextMenu>
                }
              />
            </div>
          </div>
        ) : (
          <div style={styles.emptyBrowserStateWrap}>
            <div style={styles.emptyStateCaptions}>
              <Text>{t('Browser Extension')}</Text>
              <Text color={theme.colors.colorTextSecondary}>
                {t(
                  'Create a unique pairing code to link your PearPass extension and enable autofill.'
                )}
              </Text>
            </div>
            <div style={styles.emptyStateFooter}>
              <Button
                variant="tertiary"
                size="small"
                onClick={() => toggleBrowserExtension(true)}
                iconBefore={<SwapVert width={16} height={16} />}
              >
                {t('Generate Pair Code for Browser Extension')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
