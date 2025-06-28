import React, { useState } from 'react'
import styled from 'styled-components'
import { PlatformVision } from '../types/visions'
import { VisionService } from '../services/visionService'
import VisionSelector from '../components/VisionSelector'
import LearningSessionCard from '../components/Learning/LearningSessionCard'
import TaskCard from '../components/DevTasks/TaskCard'
import { Jumbotron, JumbotronColumn, MainHeader, OneLinerContainer, OneLiner, SubOneLiner } from '../theme/components'

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.backgroundColor};
`

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`

const visionMessages = {
  [PlatformVision.LEARNING]: [
    'Learn from experts in real-time',
    'Interactive education with instant payments',
    'Master new skills with live mentorship'
  ],
  [PlatformVision.DEV_TASKS]: [
    'Get code reviewed by experts',
    'Pair programming sessions',
    'Quick development help'
  ],
  [PlatformVision.TELEHEALTH]: [
    'Consult with doctors instantly',
    'Private health consultations',
    'Medical advice on demand'
  ],
  [PlatformVision.LIVE_PERFORMANCE]: [
    'Support artists in real-time',
    'Live performances with instant tips',
    'Interactive entertainment experiences'
  ]
}

export const MultiVisionHome: React.FC = () => {
  const [currentVision, setCurrentVision] = useState<PlatformVision>(PlatformVision.LEARNING)
  const [visionService] = useState(() => new VisionService(currentVision))

  const handleVisionChange = (vision: PlatformVision): void => {
    setCurrentVision(vision)
    visionService.switchVision(vision)
  }

  const handleJoinSession = async (sessionId: string): Promise<void> => {
    // Implementation for joining a session
    console.log('Joining session:', sessionId)
  }

  const handleScheduleSession = async (sessionId: string): Promise<void> => {
    // Implementation for scheduling a session
    console.log('Scheduling session:', sessionId)
  }

  const handleApplyTask = async (taskId: string): Promise<void> => {
    // Implementation for applying to a task
    console.log('Applying to task:', taskId)
  }

  const renderVisionContent = (): React.ReactNode => {
    switch (currentVision) {
      case PlatformVision.LEARNING:
        return (
          <Grid>
            {/* Mock learning sessions */}
            <LearningSessionCard
              session={{
                id: '1',
                instructor: '0x123...',
                title: 'React Hooks Masterclass',
                description: 'Learn advanced React patterns and hooks',
                category: 'Programming',
                difficulty: 'intermediate',
                duration: 120,
                price: 50,
                maxStudents: 20,
                currentStudents: 15,
                startTime: new Date(),
                isLive: true,
                materials: [],
                prerequisites: []
              }}
              onJoin={handleJoinSession}
              onSchedule={handleScheduleSession}
            />
          </Grid>
        )

      case PlatformVision.DEV_TASKS:
        return (
          <Grid>
            {/* Mock dev tasks */}
            <TaskCard
              task={{
                id: '1',
                client: '0x456...',
                title: 'Code Review: React Component',
                description: 'Need experienced React developer to review component architecture',
                techStack: ['React', 'TypeScript', 'Styled Components'],
                complexity: 'medium',
                estimatedHours: 2,
                hourlyRate: 75,
                deadline: new Date(Date.now() + 86400000),
                status: 'open',
                requirements: [],
                deliverables: []
              }}
              onApply={handleApplyTask}
            />
          </Grid>
        )

      default:
        return (
          <OneLinerContainer>
            <OneLiner>Coming Soon!</OneLiner>
            <SubOneLiner>This vision is under development</SubOneLiner>
          </OneLinerContainer>
        )
    }
  }

  return (
    <Container>
      <Jumbotron>
        <JumbotronColumn>
          <MainHeader>Peer Stream</MainHeader>
          <SubOneLiner>{visionMessages[currentVision][0]}</SubOneLiner>
        </JumbotronColumn>
        <JumbotronColumn>
          <VisionSelector
            currentVision={currentVision}
            onVisionChange={handleVisionChange}
          />
        </JumbotronColumn>
      </Jumbotron>

      <ContentContainer>
        {renderVisionContent()}
      </ContentContainer>
    </Container>
  )
}

export default MultiVisionHome