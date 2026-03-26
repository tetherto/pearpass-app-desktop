import { useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { html } from 'htm/react'
import styled from 'styled-components'

import { PearpassLogo } from '../../svgs/PearpassLogo'
import { isV2 } from '../../utils/designVersion'

const BarInner = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
`

const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 20px;
  user-select: none;
`

export const TitleBar = () => {
  if (!isV2()) return null
  if (process.platform !== 'darwin') return null

  const { theme } = useTheme()
  const backgroundColor = theme.colors.colorBackground

  return html`
    <div
      id="bar"
      style=${{
        backgroundColor
      }}
    >
      <${BarInner}>
        <${Brand}>
          <${PearpassLogo} />
        <//>
      <//>
    </div>
  `
}
