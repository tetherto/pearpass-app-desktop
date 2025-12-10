import styled from 'styled-components'

const TRANSITION_PROPERTIES = '300ms ease-in-out'

export const SwitchBackground = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOn'].includes(prop)
})`
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  width: 30px;
  height: 16px;
  background-color: ${({ theme, isOn }) =>
    isOn ? theme.colors.grey400.mode1 : theme.colors.grey100.mode1};
  border-radius: 8px;
  position: relative;
  transition: background-color ${TRANSITION_PROPERTIES};
`

export const SwitchThumb = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOn'].includes(prop)
})`
  width: 16px;
  height: 16px;
  background-color: ${({ isOn, theme }) =>
    isOn ? theme.colors.primary400.mode1 : theme.colors.grey400.mode1};
  border: 1px solid
    ${({ theme, isOn }) =>
      isOn ? theme.colors.primary400.mode1 : theme.colors.grey200.mode1};
  border-radius: 50%;
  position: absolute;
  top: -1px;
  left: ${({ isOn }) => (isOn ? '14px' : '0')};
  transition:
    left ${TRANSITION_PROPERTIES},
    background-color ${TRANSITION_PROPERTIES};
`
