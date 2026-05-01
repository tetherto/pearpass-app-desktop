import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Button,
  NavbarListItem,
  Text,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  ArrowBackOutined,
  BugReportFilled,
  Devices,
  HubFilled,
  InfoOutlined,
  Key,
  KeyboardArrowBottom,
  KeyboardArrowRightFilled,
  LayerFilled,
  LockOutlined,
  Login,
  Logout,
  PaletteOutlined,
  SecurityFilled,
  SettingsApplicationsFilled,
  Sync,
  SystemSecurityUpdateFilled,
  Translate
} from '@tetherto/pearpass-lib-ui-kit/icons'

import { UnsavedChangesModalContent } from '../../containers/Modal/UnsavedChangesModalContent'
import { useModal } from '../../context/ModalContext'
import { useRouter } from '../../context/RouterContext'
import {
  UnsavedChangesProvider,
  useUnsavedChanges
} from '../../context/UnsavedChangesContext'
import { useTranslation } from '../../hooks/useTranslation'
import { logger } from '../../utils/logger'
import { createStyles } from './SettingsViewV2.styles'
import {
  AppPreferencesContent,
  AppVersionContent,
  BlindPeersContent,
  ExportItemsContent,
  ImportItemsContent,
  LanguageContent,
  MasterPasswordContent,
  YourDevicesContent,
  ReportAProblemContent
} from './content'
import { YourVaultsContent } from './content/YourVaultsContent'

export enum SettingsItemKey {
  AppPreferences = 'app-preferences',
  MasterPassword = 'master-password',
  BlindPeering = 'blind-peering',
  YourDevices = 'your-devices',
  YourVaults = 'your-vaults',
  ImportItems = 'import-items',
  ExportItems = 'export-items',
  Language = 'language',
  ReportAProblem = 'report-a-problem',
  AppVersion = 'app-version'
}

type SectionItem = {
  key: SettingsItemKey
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type Section = {
  key: string
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  items: SectionItem[]
}

const renderActiveContent = (
  activeItemKey: SettingsItemKey,
  currentVersion: string
): React.ReactNode => {
  switch (activeItemKey) {
    case SettingsItemKey.AppPreferences:
      return <AppPreferencesContent />
    case SettingsItemKey.MasterPassword:
      return <MasterPasswordContent />
    case SettingsItemKey.YourVaults:
      return <YourVaultsContent />
    case SettingsItemKey.BlindPeering:
      return <BlindPeersContent />
    case SettingsItemKey.YourDevices:
      return <YourDevicesContent />
    case SettingsItemKey.ImportItems:
      return <ImportItemsContent />
    case SettingsItemKey.ExportItems:
      return <ExportItemsContent />
    case SettingsItemKey.ReportAProblem:
      return <ReportAProblemContent currentVersion={currentVersion} />
    case SettingsItemKey.Language:
      return <LanguageContent />
    case SettingsItemKey.AppVersion:
      return <AppVersionContent currentVersion={currentVersion} />
    default:
      return null
  }
}

const SettingsViewV2Body = () => {
  const { t } = useTranslation()
  const { navigate, data } = useRouter()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { getGuard } = useUnsavedChanges()
  const { setModal, closeModal } = useModal()

  const sections: Section[] = useMemo(
    () => [
      {
        key: 'security',
        title: t('Security'),
        icon: SecurityFilled,
        items: [
          {
            key: SettingsItemKey.AppPreferences,
            label: t('App Preferences'),
            icon: SettingsApplicationsFilled
          },
          {
            key: SettingsItemKey.MasterPassword,
            label: t('Master Password'),
            icon: Key
          }
        ]
      },
      {
        key: 'syncing',
        title: t('Syncing'),
        icon: Sync,
        items: [
          {
            key: SettingsItemKey.BlindPeering,
            label: t('Blind Peering'),
            icon: HubFilled
          },
          {
            key: SettingsItemKey.YourDevices,
            label: t('Your Devices'),
            icon: Devices
          }
        ]
      },
      {
        key: 'vault',
        title: t('Vault'),
        icon: LockOutlined,
        items: [
          {
            key: SettingsItemKey.YourVaults,
            label: t('Your Vaults'),
            icon: LayerFilled
          },
          {
            key: SettingsItemKey.ImportItems,
            label: t('Import Items'),
            icon: Login
          },
          {
            key: SettingsItemKey.ExportItems,
            label: t('Export Items'),
            icon: Logout
          }
        ]
      },
      {
        key: 'appearance',
        title: t('Appearance'),
        icon: PaletteOutlined,
        items: [
          {
            key: SettingsItemKey.Language,
            label: t('Language'),
            icon: Translate
          }
        ]
      },
      {
        key: 'about',
        title: t('About'),
        icon: InfoOutlined,
        items: [
          {
            key: SettingsItemKey.ReportAProblem,
            label: t('Report a problem'),
            icon: BugReportFilled
          },
          {
            key: SettingsItemKey.AppVersion,
            label: t('App Version'),
            icon: SystemSecurityUpdateFilled
          }
        ]
      }
    ],
    [t]
  )

  const firstItemKey =
    sections[0]?.items[0]?.key ?? SettingsItemKey.AppPreferences
  const [activeItemKey, setActiveItemKey] = useState<SettingsItemKey>(
    (data?.initialTab as SettingsItemKey) ?? firstItemKey
  )
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({})
  const [currentVersion, setCurrentVersion] = useState('')

  useEffect(() => {
    const electronAPI = window.electronAPI
    if (!electronAPI || typeof electronAPI.getConfig !== 'function') {
      return
    }

    electronAPI
      .getConfig()
      .then((cfg) => {
        if (cfg && typeof cfg.version === 'string') {
          setCurrentVersion(cfg.version)
        }
      })
      .catch((error) =>
        logger.error('SettingsViewV2', 'Error getting runtime config:', error)
      )
  }, [])

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionKey]: !(current[sectionKey] ?? true)
    }))
  }

  const promptIfUnsaved = useCallback(
    (proceed: () => void) => {
      const guard = getGuard()
      if (!guard?.hasUnsavedChanges) {
        proceed()
        return
      }
      setModal(
        <UnsavedChangesModalContent
          description={guard.description}
          onSave={async () => {
            const ok = await guard.save()
            if (ok) {
              closeModal()
              proceed()
            }
          }}
          onDiscard={() => {
            closeModal()
            proceed()
          }}
        />
      )
    },
    [closeModal, getGuard, setModal]
  )

  const onBack = () => {
    promptIfUnsaved(() => {
      navigate('vault', { recordType: 'all' })
    })
  }

  const onSelectItem = (key: SettingsItemKey) => {
    if (key === activeItemKey) return
    promptIfUnsaved(() => {
      setActiveItemKey(key)
    })
  }

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <Button
          variant="tertiary"
          size="small"
          iconBefore={
            <ArrowBackOutined color={theme.colors.colorTextPrimary} />
          }
          onClick={onBack}
          aria-label={t('Go back')}
        />

        <Text>{t('Settings')}</Text>
      </header>

      <div style={styles.body}>
        <nav style={styles.sidebar}>
          {sections.map((section, index) => {
            const SectionIcon = section.icon
            const isExpanded = expandedSections[section.key] ?? true
            const DisclosureIcon = isExpanded
              ? KeyboardArrowBottom
              : KeyboardArrowRightFilled
            const isLast = index === sections.length - 1

            return (
              <div
                key={section.key}
                style={{
                  ...styles.sectionCard,
                  ...(index > 0 ? styles.sectionCardWithTopPadding : {}),
                  ...(isLast ? { borderBottom: 'none' } : {})
                }}
              >
                <div style={styles.sectionHeaderItem}>
                  <NavbarListItem
                    testID={`section-${section.key}`}
                    label={section.title}
                    size="small"
                    icon={
                      <>
                        <DisclosureIcon
                          color={theme.colors.colorTextSecondary}
                        />
                        <SectionIcon color={theme.colors.colorTextPrimary} />
                      </>
                    }
                    onClick={() => toggleSection(section.key)}
                  />
                </div>

                {isExpanded && (
                  <div style={styles.itemsTrack}>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon

                      return (
                        <div key={item.key} style={styles.itemRow}>
                          <div style={styles.itemAnchor} />
                          <div style={styles.itemWrapper}>
                            <NavbarListItem
                              testID={`settings-nav-${item.key}`}
                              label={item.label}
                              variant="secondary"
                              size="small"
                              selected={activeItemKey === item.key}
                              icon={
                                <ItemIcon
                                  color={theme.colors.colorTextSecondary}
                                />
                              }
                              onClick={() => onSelectItem(item.key)}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <main style={styles.contentArea}>
          {renderActiveContent(activeItemKey, currentVersion)}
        </main>
      </div>
    </div>
  )
}

export const SettingsViewV2 = () => (
  <UnsavedChangesProvider>
    <SettingsViewV2Body />
  </UnsavedChangesProvider>
)
