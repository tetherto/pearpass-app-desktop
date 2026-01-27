import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  `
  
export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  `

export const TooltipContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
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

export const ListContainer = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 5px;
  padding-left: 20px;
  list-style-type: disc;
`