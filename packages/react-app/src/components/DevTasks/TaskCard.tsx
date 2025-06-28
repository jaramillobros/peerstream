import React from 'react'
import styled from 'styled-components'
import { DevTask } from '../../types/visions'
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

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  
  ${({ status }) => {
    switch (status) {
      case 'open':
        return 'background: #e8f5e8; color: #2d5a2d;'
      case 'in_progress':
        return 'background: #fff3cd; color: #856404;'
      case 'review':
        return 'background: #d1ecf1; color: #0c5460;'
      case 'completed':
        return 'background: #d4edda; color: #155724;'
      default:
        return 'background: #f8f9fa; color: #6c757d;'
    }
  }}
`

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`

const TechTag = styled.span`
  background: ${({ theme }) => theme.tertiaryGreen};
  color: ${({ theme }) => theme.primaryGreen};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
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

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.primaryGreen};
  color: white;
  border: none;
  border-radius: 6px;
  font-family: Ubuntu;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.secondaryGreen};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

interface TaskCardProps {
  task: DevTask
  onApply: (taskId: string) => Promise<void>
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onApply }) => {
  const applyOperation = useAsyncOperation(
    () => onApply(task.id),
    { showSuccessMessage: true, successMessage: 'Application submitted!' }
  )

  const formatDeadline = (date: Date): string => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days`
  }

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case 'simple': return '#28a745'
      case 'medium': return '#ffc107'
      case 'complex': return '#dc3545'
      default: return '#6c757d'
    }
  }

  return (
    <Card>
      <Header>
        <div>
          <Title>{task.title}</Title>
          <TechStack>
            {task.techStack.map((tech, index) => (
              <TechTag key={index}>{tech}</TechTag>
            ))}
          </TechStack>
        </div>
        <StatusBadge status={task.status}>{task.status.replace('_', ' ')}</StatusBadge>
      </Header>

      <Description>{task.description}</Description>

      <Details>
        <DetailItem>
          <DetailLabel>Rate</DetailLabel>
          <DetailValue>${task.hourlyRate}/hr</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Estimated</DetailLabel>
          <DetailValue>{task.estimatedHours}h</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Deadline</DetailLabel>
          <DetailValue>{formatDeadline(task.deadline)}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Complexity</DetailLabel>
          <DetailValue style={{ color: getComplexityColor(task.complexity) }}>
            {task.complexity}
          </DetailValue>
        </DetailItem>
      </Details>

      {task.status === 'open' && (
        <Actions>
          <Button
            onClick={() => applyOperation.execute()}
            disabled={applyOperation.isLoading}
          >
            {applyOperation.isLoading && <LoadingSpinner size={16} />}
            Apply for Task
          </Button>
        </Actions>
      )}
    </Card>
  )
}

export default TaskCard