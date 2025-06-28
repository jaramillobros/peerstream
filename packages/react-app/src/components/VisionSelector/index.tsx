import React from 'react'
import styled from 'styled-components'
import { PlatformVision } from '../../types/visions'

const SelectorContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.tertiaryGreen};
  border-radius: 8px;
  margin-bottom: 2rem;
`

const VisionCard = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 1.5rem;
  border: 2px solid ${({ isActive, theme }) => isActive ? theme.primaryGreen : theme.placeholderGray};
  border-radius: 8px;
  background: ${({ isActive, theme }) => isActive ? theme.primaryGreen : 'white'};
  color: ${({ isActive, theme }) => isActive ? 'white' : theme.primaryGreen};
  cursor: pointer;
  transition: all 0.2s;
  font-family: Ubuntu;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const VisionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`

const VisionTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`

const VisionDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
`

interface VisionSelectorProps {
  currentVision: PlatformVision
  onVisionChange: (vision: PlatformVision) => void
}

const visionData = {
  [PlatformVision.LEARNING]: {
    icon: '📚',
    title: 'Learning Platform',
    description: 'Live education & skill development'
  },
  [PlatformVision.DEV_TASKS]: {
    icon: '💻',
    title: 'Dev Tasks',
    description: 'Code reviews & development help'
  },
  [PlatformVision.TELEHEALTH]: {
    icon: '🏥',
    title: 'Telehealth',
    description: 'Medical consultations & health advice'
  },
  [PlatformVision.LIVE_PERFORMANCE]: {
    icon: '🎨',
    title: 'Live Performance',
    description: 'Streaming performances & entertainment'
  }
}

export const VisionSelector: React.FC<VisionSelectorProps> = ({
  currentVision,
  onVisionChange
}) => {
  return (
    <SelectorContainer>
      {Object.entries(visionData).map(([vision, data]) => (
        <VisionCard
          key={vision}
          isActive={currentVision === vision}
          onClick={() => onVisionChange(vision as PlatformVision)}
        >
          <VisionIcon>{data.icon}</VisionIcon>
          <VisionTitle>{data.title}</VisionTitle>
          <VisionDescription>{data.description}</VisionDescription>
        </VisionCard>
      ))}
    </SelectorContainer>
  )
}

export default VisionSelector