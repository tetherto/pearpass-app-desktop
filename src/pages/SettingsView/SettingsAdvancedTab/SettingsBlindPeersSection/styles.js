import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

export const LearnMoreLink = styled.a`
  font-family: 'Inter';
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary400.mode1};
  font-weight: 700;
  text-decoration: none;

  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    text-decoration: underline;
  }
`

export const TooltipContent = styled.div`
  font-family: 'Inter';
  font-size: 14px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.white.mode1};

  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 400px;
`

export const TooltipText = styled.div`
  display: flex;
  flex-direction: column;
`

export const ListContainer = styled.ul`
  margin: 10px 0;
  padding-left: 20px;
  list-style-type: disc;
`
