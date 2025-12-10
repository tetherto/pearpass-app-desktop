import styled from 'styled-components'

export const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 447px;
    object-fit: contain;
    border-radius: 10px;
  }
`

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
  flex-shrink: 0;
  width: 100%;
`

export const Name = styled.p`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const ShareIconWrapper = styled.div`
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
