import styled, { css } from 'styled-components'

export const RecordWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSelected', 'open'].includes(prop)
})`
  width: 100%;
  height: auto;
  display: flex;
  min-height: 45px;
  padding: 5px 10px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;

  ${({ isSelected }) =>
    isSelected &&
    css`
      background: rgba(134, 170, 172, 0.4);
    `}

  ${({ open }) =>
    open &&
    css`
      background: rgba(134, 170, 172, 0.2);
      pointer-events: auto;
    `}
    
  &:hover {
    background: ${({ isSelected }) =>
      !isSelected && 'rgba(134, 170, 172, 0.2)'};
  }
`

export const RecordInformation = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const RecordName = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  & p {
    color: ${({ theme }) => theme.colors.grey100.mode1};
    font-size: 12px;
  }
`

export const RecordActions = styled.div`
  display: flex;
  align-items: center;
`
