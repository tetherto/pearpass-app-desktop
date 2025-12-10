import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  border-radius: 15px;
  padding: 6px 10px;
  background: ${({ theme }) => theme.colors.black.mode1};
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 16px;
`

export const IconWrapper = styled.label`
  display: flex;
  flex-grow: 0;
`

export const Input = styled.input`
  all: unset;
  display: flex;
  width: 100%;
  flex: 1;
  color: ${({ theme }) => theme.colors.grey200.mode1};
  align-self: stretch;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
`

export const QuantityWrapper = styled.div`
  flex-grow: 0;
  color: ${({ theme }) => theme.colors.white.mode1};
  font-weight: 200;
`
