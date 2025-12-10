import styled from 'styled-components'

export const CardContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
  align-items: center;
  width: 609px;
`

export const CardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  max-width: 489px;

  color: ${({ theme }) => theme.colors.white.mode1};
  padding: 4px 0px;
  text-align: center;
  font-family: 'Inter';
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`

export const Title = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`
export const Description = styled.p`
  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 16px;
  font-style: normal;
  font-weight: 300;
  line-height: normal;
`

export const ButtonWrapper = styled.div`
  align-self: center;
`

export const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const InputLabel = styled.label`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`

export const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  & > :first-child {
    pointer-events: none;
    border-color: ${({ theme, isError }) =>
      isError ? theme.colors.errorRed.mode1 : theme.colors.primary400.mode1};
  }
`

export const RadioText = styled.span`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const RadioTextBold = styled.a`
  cursor: pointer;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white.mode1};
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
`

export const RequirementsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  color: ${({ theme }) => theme.colors.grey100.mode1};
  font-family: 'Inter';
  font-size: 14px;
  line-height: normal;
`

export const BulletList = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
`

export const BulletItem = styled.li`
  font-size: 14px;
`

export const NoteText = styled.p`
  font-size: 14px;
`
