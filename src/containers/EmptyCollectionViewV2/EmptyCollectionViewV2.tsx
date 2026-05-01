import React, { useMemo } from 'react'

import { Button, Text, Title, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { Add, ImportExport } from '@tetherto/pearpass-lib-ui-kit/icons'

import {
  ILLUSTRATION_HEIGHT,
  createStyles
} from './EmptyCollectionViewV2.styles'
import { useAppHeaderContext } from '../../context/AppHeaderContext'
import { useRouter } from '../../context/RouterContext'
import { useRecordMenuItemsV2 } from '../../hooks/useRecordMenuItemsV2'
import { useTranslation } from '../../hooks/useTranslation'
import { SettingsItemKey } from '../../pages/SettingsViewV2/SettingsViewV2'
import { ItemCardIllustration } from '../../svgs/ItemCardIllustration'

type EmptyCollectionViewV2Props = {
  recordType?: string
  selectedFolder?: string
  isFavoritesView?: boolean
}

export const EmptyCollectionViewV2 = ({
  recordType = 'all',
  selectedFolder,
  isFavoritesView = false
}: EmptyCollectionViewV2Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { navigate } = useRouter()
  const { setIsAddMenuOpen } = useAppHeaderContext()
  const { categoriesItems } = useRecordMenuItemsV2()
  const styles = createStyles()

  const handleAddItem = () => {
    setIsAddMenuOpen(true)
  }

  const handleImport = () => {
    navigate('settings', { initialTab: SettingsItemKey.ImportItems })
  }

  const categoryLabel = categoriesItems.find(
    (item) => item.type === recordType
  )?.label

  const { title, descriptionParagraphs } = useMemo<{
    title: string
    descriptionParagraphs: string[]
  }>(() => {
    if (isFavoritesView) {
      return {
        title: t('No favorite items'),
        descriptionParagraphs: [t('Mark items as favorites')]
      }
    }

    if (selectedFolder) {
      return {
        title: t('Empty folder'),
        descriptionParagraphs: [
          t('Start adding items or save existing ones in the {folder} folder', {
            folder: selectedFolder
          })
        ]
      }
    }

    if (recordType !== 'all' && categoryLabel) {
      return {
        title: t('No item of type {category}', { category: categoryLabel }),
        descriptionParagraphs: [
          t('Start adding items of type {category} in your vault', {
            category: categoryLabel
          })
        ]
      }
    }

    return {
      title: t('No item saved'),
      descriptionParagraphs: [
        t('Start using PearPass by creating your first item'),
        t('or import your items from a different password manager')
      ]
    }
  }, [isFavoritesView, selectedFolder, recordType, categoryLabel, t])

  return (
    <div style={styles.container} data-testid="empty-collection-v2">
      <div style={styles.content}>
        <div style={styles.illustration}>
          <ItemCardIllustration width={null} height={ILLUSTRATION_HEIGHT} />
        </div>

        <div style={styles.textBlock}>
          <Title as="h2" data-testid="empty-collection-v2-title">
            {title}
          </Title>
          {descriptionParagraphs.map((paragraph, index) => (
            <Text
              key={index}
              as="p"
              variant="label"
              color={theme.colors.colorTextSecondary}
              style={
                styles.descriptionParagraph as unknown as React.ComponentProps<
                  typeof Text
                >['style']
              }
            >
              {paragraph}
            </Text>
          ))}
        </div>

        {!isFavoritesView && (
          <div style={styles.ctas}>
            <div style={styles.ctaButton}>
              <Button
                variant="primary"
                size="small"
                fullWidth
                data-testid="empty-collection-v2-add"
                iconBefore={<Add width={16} height={16} />}
                onClick={handleAddItem}
              >
                {t('Add Item')}
              </Button>
            </div>
            <div style={styles.ctaButton}>
              <Button
                variant="secondary"
                size="small"
                fullWidth
                data-testid="empty-collection-v2-import"
                iconBefore={
                  <ImportExport
                    width={16}
                    height={16}
                    color={theme.colors.colorTextPrimary}
                  />
                }
                onClick={handleImport}
              >
                {t('Import Items')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
