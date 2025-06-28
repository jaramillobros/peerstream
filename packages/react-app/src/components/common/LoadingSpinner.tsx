import React from 'react'
import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const SpinnerContainer = styled.div<{ size?: number }>`
  display: inline-block;
  width: ${({ size = 40 }) => size}px;
  height: ${({ size = 40 }) => size}px;
`

const SpinnerElement = styled.div<{ size?: number }>`
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: ${({ size = 40 }) => size * 0.8}px;
  height: ${({ size = 40 }) => size * 0.8}px;
  margin: ${({ size = 40 }) => size * 0.1}px;
  border: ${({ size = 40 }) => size * 0.1}px solid ${({ theme }) => theme.primaryGreen};
  border-radius: 50%;
  animation: ${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: ${({ theme }) => theme.primaryGreen} transparent transparent transparent;

  &:nth-child(1) {
    animation-delay: -0.45s;
  }
  &:nth-child(2) {
    animation-delay: -0.3s;
  }
  &:nth-child(3) {
    animation-delay: -0.15s;
  }
`

interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  className 
}) => {
  return (
    <SpinnerContainer size={size} className={className}>
      <SpinnerElement size={size} />
      <SpinnerElement size={size} />
      <SpinnerElement size={size} />
      <SpinnerElement size={size} />
    </SpinnerContainer>
  )
}

export default LoadingSpinner