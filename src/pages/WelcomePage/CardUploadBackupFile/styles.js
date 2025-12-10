import styled from 'styled-components'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  width: 480px;
`
export const Header = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

export const UploadFileTitle = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;

  color: ${({ theme }) => theme.colors.white.mode1};
  text-align: center;
  font-family: 'Inter';
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`
