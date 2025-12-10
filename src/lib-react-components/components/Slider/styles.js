import styled from 'styled-components'

export const StyledRange = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  cursor: pointer;
  outline: none;
  border-radius: 15px;
  height: 10px;
  background: ${({ theme, value = 0, max = 0, min = 0 }) => {
    const maxValue = parseFloat(max)
    const minValue = parseFloat(min)
    const progress = ((value - minValue) / (maxValue - minValue)) * 100

    return `linear-gradient(to right, ${theme.colors.primary300.mode1} ${progress}%, ${theme.colors.grey200.mode1} ${progress}%)`
  }};

  &::-webkit-slider-runnable-track {
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 15px;
    width: 15px;
    background-color: ${({ theme }) => theme.colors.primary400.mode1};
    border-radius: 50%;
    border: none;
    transition: 300ms ease-in-out;

    &:hover {
      box-shadow: 0 0 0 4px
        ${({ theme }) => `${theme.colors.primary400.mode1}66`};
    }
  }

  &:active::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px ${({ theme }) => `${theme.colors.primary400.mode1}66`};
  }

  &:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px ${({ theme }) => `${theme.colors.primary400.mode1}66`};
  }
`
