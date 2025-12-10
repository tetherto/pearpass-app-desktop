import { html } from 'htm/react'

import {
  Background,
  BottomGradient,
  ContentWrapper,
  LeftSpotlightWrapper,
  LogoContainer,
  PageContent,
  PearPass
} from './styles'
import { LogoLock } from '../../svgs/LogoLock'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  isAuthScreen: boolean
 * }} props
 */
export const InitialPageWrapper = ({ children, isAuthScreen = false }) => html`
  <${Background} isAuthScreen=${isAuthScreen}>
    <${LeftSpotlightWrapper} isAuthScreen=${isAuthScreen} />

    <${PageContent} isAuthScreen=${isAuthScreen}>
      <${LogoContainer}>
        <${LogoLock} width="42" height="57" />
        <${PearPass}>PearPass<//>
      <//>

      <${ContentWrapper}> ${children} <//>
    <//>

    <${BottomGradient} isAuthScreen=${isAuthScreen} />
  <//>
`
