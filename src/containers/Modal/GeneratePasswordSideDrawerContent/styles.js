import styled from 'styled-components'

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
`

export const HeaderChildrenWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`

export const CloseIconWrapper = styled.div`
  margin-left: auto;
  display: flex;
  padding: 2.5px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.black.dark};
  flex-shrink: 0;
`

export const HeaderButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

export const PasswordWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 42px;
  min-height: 20px;
  gap: 8px;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 400;
  text-align: center;

  & > div > div {
    font-size: 10px;
  }
`

export const RadioWrapper = styled.div`
  margin-top: 32px;
`

export const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
`

export const SliderContainer = styled.div`
  width: 240px;
`

export const SliderLabel = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 400;
`

export const SwitchWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 9px;
  gap: 9px;
`
