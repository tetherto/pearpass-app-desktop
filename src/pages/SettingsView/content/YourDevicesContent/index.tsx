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
  Add,
  MoreVert,
  PublicOutlined,
  SwapVert
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { formatDate } from '@tetherto/pear-apps-utils-date'

import { PAIRING_STATES } from '../../../../constants/pairing'
import { useConnectExtension } from '../../../../hooks/useConnectExtension'
import { usePairedBrowsers } from '../../../../hooks/usePairedBrowsers'
import { useTranslation } from '../../../../hooks/useTranslation'
import { createStyles } from './styles'

const TEST_IDS = {
  root: 'settings-your-devices',
  extensionSection: 'settings-card-browser-extension-connections',
  extensionActionButton: 'settings-browser-extension-action',
  addBrowserButton: 'settings-browser-extension-add',
  disableButton: 'settings-browser-extension-disable'
} as const

type PairedBrowser = {
  publicKey: string
  label: string
  pairingState: string
  pairedAt: string
}

export const YourDevicesContent = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { isBrowserExtensionEnabled, addBrowser, unpairBrowser, disableBrowserExtension } =
    useConnectExtension()
  const { browsers } = usePairedBrowsers()

  const hasBrowsers = browsers.length > 0

  const getSubtitle = (browser: PairedBrowser) => {
    if (browser.pairingState !== PAIRING_STATES.CONFIRMED) {
      return t('Waiting for the browser to confirm…')
    }

    try {
      return t('Paired on {date}', {
        date: formatDate(browser.pairedAt, 'dd-mm-yy', '/')
      })
    } catch {
      return undefined
    }
  }

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
        {hasBrowsers ? (
          <div style={styles.list}>
            {(browsers as PairedBrowser[]).map((browser, index) => (
              <div
                key={browser.publicKey}
                style={
                  index < browsers.length - 1
                    ? styles.listItemBorder
                    : undefined
                }
              >
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
                  title={browser.label}
                  subtitle={getSubtitle(browser)}
                  testID={`settings-device-item-${index}`}
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
                          data-testid={`${TEST_IDS.extensionActionButton}-${index}`}
                          aria-label={t('Browser extension actions')}
                        />
                      }
                    >
                      <NavbarListItem
                        label={t('Unpair {label}', { label: browser.label })}
                        variant="destructive"
                        onClick={() => unpairBrowser(browser.publicKey)}
                      />
                    </ContextMenu>
                  }
                />
              </div>
            ))}

            <div style={styles.footer}>
              <Button
                variant="tertiary"
                size="small"
                onClick={addBrowser}
                iconBefore={<Add width={16} height={16} />}
                data-testid={TEST_IDS.addBrowserButton}
              >
                {t('Add Browser Extension')}
              </Button>
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
                onClick={addBrowser}
                iconBefore={<SwapVert width={16} height={16} />}
                data-testid={TEST_IDS.addBrowserButton}
              >
                {t('Generate Pair Code for Browser Extension')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {isBrowserExtensionEnabled ? (
        <div style={styles.disableWrap}>
          <Button
            variant="destructive"
            size="small"
            onClick={disableBrowserExtension}
            data-testid={TEST_IDS.disableButton}
          >
            {t('Turn off browser extension connections')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
