import React, { useState, useEffect, ReactNode, CSSProperties } from 'react'
import styled from 'styled-components'
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

interface ContainerProps {
  $backgroundColor: string
}

const Container = styled.div<ContainerProps>`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.$backgroundColor};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const SVGBackground = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`

interface BackgroundWithGradientProps {
  children?: ReactNode
  style?: CSSProperties
  backgroundColor?: string
  gradientColors?: string[]
}

export const BackgroundWithGradient: React.FC<BackgroundWithGradientProps> = ({
  children,
  style,
  backgroundColor: customBg,
  gradientColors: customGradientColors
}) => {
  const { theme } = useTheme()
  const backgroundColor = customBg || theme.colors.colorSurfacePrimary
  const gradientColors = customGradientColors || ['#2A3317', backgroundColor]

  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const radius = Math.max(dimensions.width, dimensions.height) * 0.4
  const cx = dimensions.width / 2
  const cy = dimensions.height * 0.45

  return (
    <Container $backgroundColor={backgroundColor} style={style}>
      <SVGBackground>
        <defs>
          <radialGradient
            id="bg-grad"
            cx={cx}
            cy={cy}
            r={radius}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={gradientColors[0]} stopOpacity="0.7" />
            <stop
              offset="60%"
              stopColor={gradientColors[1]}
              stopOpacity="0.5"
            />
            <stop offset="100%" stopColor={backgroundColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-grad)" />
      </SVGBackground>
      {children}
    </Container>
  )
}
