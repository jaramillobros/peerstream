import React, { useState } from 'react'
import styled from 'styled-components'
import { LearningSession } from '../../types/visions'
import { useAsyncOperation } from '../../hooks/useAsyncOperation'
import LoadingSpinner from '../common/LoadingSpinner'

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`

const Title = styled.h3`
  color: ${({ theme }) => theme.primaryGreen};
  margin: 0 0 0.5rem 0;
  font-family: Ubuntu;
`

const LiveBadge = styled.span`
  background: #ff4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`

const Category = styled.span`
  background: ${({ theme }) => theme.tertiaryGreen};
  color: ${({ theme }) => theme.primaryGreen};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
`

const Description = styled.p`
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 1rem;
  line-height: 1.5;
`

const Details = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const DetailItem = styled.div`
  text-align: center;
`

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textColor};
  opacity: 0.7;
`

const DetailValue = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.primaryGreen};
  margin-top: 0.25rem;
`

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-family: Ubuntu;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${({ variant, theme }) => variant === 'secondary' ? `
    background: transparent;
    color: ${theme.primaryGreen};
    border: 1px solid ${theme.primaryGreen};
    &:hover:not(:disabled) {
      background: ${theme.tertiaryGreen};
    }
  ` : `
    background: ${theme.primaryGreen};
    color: white;
    &:hover:not(:disabled) {
      background: ${theme.secondaryGreen};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

interface LearningSessionCardProps {
  session: LearningSession
  onJoin: (sessionId: string) => Promise<void>
  onSchedule: (sessionId: string) => Promise<void>
}

export const LearningSessionCard: React.FC<LearningSessionCardProps> = ({
  session,
  onJoin,
  onSchedule
}) => {
  const joinOperation = useAsyncOperation(
    () => onJoin(session.id),
    { showSuccessMessage: true, successMessage: 'Joined session successfully!' }
  )

  const scheduleOperation = useAsyncOperation(
    () => onSchedule(session.id),
    { showSuccessMessage: true, successMessage: 'Session scheduled!' }
  )

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatPrice = (price: number): string => {
    return `${price} DAI/hour`
  }

  const isSessionFull = session.currentStudents >= session.maxStudents
  const canJoin = session.isLive && !isSessionFull

  return (
    <Card>
      <Header>
        <div>
          <Title>{session.title}</Title>
          <Category>{session.category}</Category>
        </div>
        {session.isLive && <LiveBadge>🔴 LIVE</LiveBadge>}
      </Header>

      <Description>{session.description}</Description>

      <Details>
        <DetailItem>
          <DetailLabel>Duration</DetailLabel>
          <DetailValue>{formatDuration(session.duration)}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Price</DetailLabel>
          <DetailValue>{formatPrice(session.price)}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Students</DetailLabel>
          <DetailValue>{session.currentStudents}/{session.maxStudents}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Level</DetailLabel>
          <DetailValue>{session.difficulty}</DetailValue>
        </DetailItem>
      </Details>

      <Actions>
        {!session.isLive && (
          <Button
            variant="secondary"
            onClick={() => scheduleOperation.execute()}
            disabled={scheduleOperation.isLoading}
          >
            {scheduleOperation.isLoading && <LoadingSpinner size={16} />}
            Schedule
          </Button>
        )}
        
        <Button
          onClick={() => joinOperation.execute()}
          disabled={!canJoin || joinOperation.isLoading}
        >
          {joinOperation.isLoading && <LoadingSpinner size={16} />}
          {session.isLive ? 'Join Live' : 'Join Session'}
        </Button>
      </Actions>
    </Card>
  )
}

export default LearningSessionCard