import styled from 'styled-components'

export const LoadVaultCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isLoading'].includes(prop)
})`
  font-family: 'Inter';
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 480px;
  gap: 40px;
  cursor: ${({ isLoading }) => (isLoading ? 'wait' : 'default')};

  & > * {
    pointer-events: ${({ isLoading }) => (isLoading ? 'none' : 'auto')};
  }
`

export const LoadVaultTitle = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;

  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`

export const LoadVaultNotice = styled.div`
  white-space: nowrap;
  margin-top: 8px;

  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: left;
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const InputContainer = styled.div`
  width: 100%;
`

export const LoadVaultInput = styled.input`
  display: flex;
  width: 100%;
  padding: 12px 20px;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.grey400.mode1};
  border: 1px solid ${({ theme }) => theme.colors.grey300.mode1};
  color: ${({ theme }) => theme.colors.white.mode1};

  &::placeholder {
    color: ${({ theme }) => theme.colors.grey100.mode1};
  }

  &:active,
  &:focus {
    box-shadow: none;
    outline: none;
    border: 1px solid ${({ theme }) => theme.colors.grey200.mode1};
  }
`

export const Header = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`
