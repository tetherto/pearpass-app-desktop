import styled from 'styled-components'
import { rawTokens } from '@tetherto/pearpass-lib-ui-kit'

export const Shell = styled.form`
  display: flex;
  width: min(100%, 500px);
  flex-direction: column;
  gap: ${rawTokens.spacing24}px;
`

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${rawTokens.spacing6}px;
  text-align: center;
`

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`

export const ButtonIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`
