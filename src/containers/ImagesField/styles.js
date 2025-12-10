import styled from 'styled-components'

export const Container = styled.div`
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;

  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.grey100.mode1};
  background: ${({ theme }) => theme.colors.grey400.mode1};
`

export const Header = styled.div`
  display: flex;
  gap: 10px;
`

export const Title = styled.div`
  color: ${({ theme }) => theme.colors.white.mode1};
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`

export const Body = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 50px;
`

export const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  width: 90px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.primary400.mode1};
`

export const DeleteOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 1;
  }
`

export const DeleteIconWrapper = styled.div`
  width: 20px;
  height: 20px;
  position: absolute;
  top: 0px;
  right: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary400.mode1};
  cursor: pointer;
`

export const Photo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

export const AddContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 50px;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.primary400.mode1};
  cursor: pointer;
`
