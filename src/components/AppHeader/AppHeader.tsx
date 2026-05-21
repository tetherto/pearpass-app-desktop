import React, { type ReactNode } from 'react'

import { Button, useTheme, SearchField } from '@tetherto/pearpass-lib-ui-kit'
import { Add, ImportOutlined } from '@tetherto/pearpass-lib-ui-kit/icons'

import { createStyles } from './AppHeader.styles'
import { useTranslation } from '../../hooks/useTranslation'

export type AppHeaderProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  onImportClick: () => void
  addItemControl: ReactNode
  searchTestId?: string
  importTestId?: string
}

export const AppHeader = ({
  searchValue,
  onSearchChange,
  onImportClick,
  addItemControl,
  searchTestId = 'main-search-input',
  importTestId = 'main-import-button',
}: AppHeaderProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { root, searchWrap, search, actions } = styles

  return (
    <header style={root} id="bar">
      <div style={searchWrap}>
        <div style={search}>
          <SearchField
            testID={searchTestId}
            value={searchValue}
            onChangeText={onSearchChange}
            placeholderText={t('Search in All Items')}
          />
        </div>
      </div>
      <div style={actions}>
        <Button
          variant="secondary"
          size="small"
          type="button"
          data-testid={importTestId}
          onClick={onImportClick}
          iconBefore={
            <ImportOutlined
              width={18}
              height={18}
            />
          }
        >
          {t('Import')}
        </Button>
        {addItemControl}
      </div>
    </header>
  )
}

type AppHeaderAddItemTriggerProps = {
  testId?: string
}

export const AppHeaderAddItemTrigger = ({
  testId = 'main-plus-button'
}: AppHeaderAddItemTriggerProps) => {
  const { t } = useTranslation()

  return (
    <Button
      variant="primary"
      size="small"
      type="button"
      data-testid={testId}
      iconBefore={
        <Add width={18} height={18} />
      }
    >
      {t('Add Item')}
    </Button>
  )
}
