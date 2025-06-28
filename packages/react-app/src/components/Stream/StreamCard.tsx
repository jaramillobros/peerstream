import React, { useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { Stream, StreamStatus } from '../../types'
import { StreamService } from '../../services/streamService'
import { useAsyncOperation } from '../../hooks/useAsyncOperation'
import { useNotification } from '../../hooks/useNotification'
import LoadingSpinner from '../common/LoadingSpinner'
import ConfirmationModal from '../common/ConfirmationModal'

const Card = styled.div`
  background: ${({ theme }) => theme.tertiaryGreen};
  border: 1px solid ${({ theme }) => theme.primaryGreen};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const StreamId = styled.h3`
  color: ${({ theme }) => theme.primaryGreen};
  font-family: Ubuntu;
  margin: 0;
`

const StatusBadge = styled.span<{ status: StreamStatus }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  
  ${({ status, theme }) => {
    switch (status) {
      case StreamStatus.ACTIVE:
        return `background: #e8f5e8; color: #2d5a2d;`
      case StreamStatus.PENDING:
        return `background: #fff3cd; color: #856404;`
      case StreamStatus.COMPLETED:
        return `background: #d1ecf1; color: #0c5460;`
      case StreamStatus.CANCELLED:
        return `background: #f8d7da; color: #721c24;`
      default:
        return `background: ${theme.tertiaryGreen}; color: ${theme.primaryGreen};`
    }
  }}
`

const Details = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`

const DetailLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textColor};
  opacity: 0.7;
  margin-bottom: 0.25rem;
`

const DetailValue = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.primaryGreen};
  font-family: Ubuntu;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.placeholderGray};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
`

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, ${({ theme }) => theme.primaryGreen}, ${({ theme }) => theme.secondaryGreen});
  width: ${({ progress }) => Math.min(progress, 100)}%;
  transition: width 0.3s ease;
`

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-family: Ubuntu;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${({ variant, theme }) => variant === 'danger' ? `
    background: #dc3545;
    color: white;
    &:hover:not(:disabled) {
      background: #c82333;
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

interface StreamCardProps {
  stream: Stream
  streamService: StreamService
  onStreamUpdate: () => void
  currentUserAddress: string
}

export const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  streamService,
  onStreamUpdate,
  currentUserAddress
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const { showSuccess } = useNotification()

  const withdrawOperation = useAsyncOperation(
    async () => {
      await streamService.withdrawFromStream(stream.id)
      onStreamUpdate()
    },
    {
      showSuccessMessage: true,
      successMessage: 'Withdrawal successful!'
    }
  )

  const cancelOperation = useAsyncOperation(
    async () => {
      await streamService.cancelStream(stream.id)
      onStreamUpdate()
      setShowCancelModal(false)
    },
    {
      showSuccessMessage: true,
      successMessage: 'Stream cancelled successfully!'
    }
  )

  const status = streamService.getStreamStatus(stream)
  const streamedAmount = streamService.calculateStreamedAmount(stream)
  const totalAmount = stream.deposit
  const progress = totalAmount.gt(0) ? streamedAmount.mul(100).div(totalAmount).toNumber() : 0

  const formatAmount = (amount: ethers.BigNumber): string => {
    return parseFloat(ethers.utils.formatEther(amount)).toFixed(4)
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const isRecipient = currentUserAddress.toLowerCase() === stream.recipient.toLowerCase()
  const isSender = currentUserAddress.toLowerCase() === stream.sender.toLowerCase()
  const canWithdraw = isRecipient && status === StreamStatus.ACTIVE && streamedAmount.gt(0)
  const canCancel = isSender && (status === StreamStatus.ACTIVE || status === StreamStatus.PENDING)

  return (
    <>
      <Card>
        <Header>
          <StreamId>Stream #{stream.id}</StreamId>
          <StatusBadge status={status}>{status}</StatusBadge>
        </Header>

        <Details>
          <DetailItem>
            <DetailLabel>Total Amount</DetailLabel>
            <DetailValue>{formatAmount(totalAmount)} ETH</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Streamed</DetailLabel>
            <DetailValue>{formatAmount(streamedAmount)} ETH</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Start Date</DetailLabel>
            <DetailValue>{formatDate(stream.startTime)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>End Date</DetailLabel>
            <DetailValue>{formatDate(stream.stopTime)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>{isRecipient ? 'From' : 'To'}</DetailLabel>
            <DetailValue>
              {isRecipient ? stream.sender.slice(0, 8) + '...' : stream.recipient.slice(0, 8) + '...'}
            </DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Remaining</DetailLabel>
            <DetailValue>{formatAmount(stream.remainingBalance)} ETH</DetailValue>
          </DetailItem>
        </Details>

        {status === StreamStatus.ACTIVE && (
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
        )}

        <Actions>
          {canWithdraw && (
            <ActionButton
              onClick={() => withdrawOperation.execute()}
              disabled={withdrawOperation.isLoading}
            >
              {withdrawOperation.isLoading && <LoadingSpinner size={16} />}
              Withdraw
            </ActionButton>
          )}
          {canCancel && (
            <ActionButton
              variant="danger"
              onClick={() => setShowCancelModal(true)}
              disabled={cancelOperation.isLoading}
            >
              Cancel Stream
            </ActionButton>
          )}
        </Actions>
      </Card>

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => cancelOperation.execute()}
        title="Cancel Stream"
        message="Are you sure you want to cancel this stream? This action cannot be undone."
        confirmText="Cancel Stream"
        isLoading={cancelOperation.isLoading}
      />
    </>
  )
}

export default StreamCard