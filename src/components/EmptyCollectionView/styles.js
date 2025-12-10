import styled from 'styled-components'

export const CollectionsWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

export const CollectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: 10px;
`

export const CollectionsTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 12px;
  font-weight: 600;

  & span {
    font-weight: 600;
  }

  & p {
    font-weight: 400;
  }
`
