import React, { useState } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import DateTimePicker from 'react-datetime-picker'
import Modal from '../Modal'
import { StreamConfig } from '../../types'
import { StreamService } from '../../services/streamService'
import { useAsyncOperation } from '../../hooks/useAsyncOperation'
import { useAllTokenDetails } from '../../contexts/Tokens'
import LoadingSpinner from '../common/LoadingSpinner'
import { ReactComponent as Close } from '../../assets/img/x.svg'

const ModalContent = styled.div`
  width: 100%;
  max-width: 600px;
`

const ModalHeader = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: ${({ theme }) => theme.secondaryGreen};
  color: white;
  border-radius: 8px 8px 0 0;
`

const Title = styled.h2`
  margin: 0;
  font-family: Ubuntu;
  font-size: 1.5rem;
`

const CloseButton = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`

const Form = styled.form`
  padding: 2rem;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryGreen};
  font-family: Ubuntu;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.placeholderGray};
  border-radius: 6px;
  font-size: 1rem;
  font-family: Ubuntu;
  background: ${({ theme }) => theme.tertiaryGreen};
  color: ${({ theme }) => theme.primaryGreen};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primaryGreen};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryGreen}20;
  }

  &:invalid {
    border-color: #dc3545;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.placeholderGray};
  border-radius: 6px;
  font-size: 1rem;
  font-family: Ubuntu;
  background: ${({ theme }) => theme.tertiaryGreen};
  color: ${({ theme }) => theme.primaryGreen};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primaryGreen};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryGreen}20;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.placeholderGray};
  border-radius: 6px;
  font-size: 1rem;
  font-family: Ubuntu;
  background: ${({ theme }) => theme.tertiaryGreen};
  color: ${({ theme }) => theme.primaryGreen};
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primaryGreen};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primaryGreen}20;
  }
`

const DateTimeContainer = styled.div`
  .react-datetime-picker {
    width: 100%;
  }
  
  .react-datetime-picker__wrapper {
    border: 1px solid ${({ theme }) => theme.placeholderGray};
    border-radius: 6px;
    padding: 0.75rem;
    background: ${({ theme }) => theme.tertiaryGreen};
  }
`

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-family: Ubuntu;
  font-size: 1rem;
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

const InfoBox = styled.div`
  background: ${({ theme }) => theme.tertiaryGreen};
  border: 1px solid ${({ theme }) => theme.primaryGreen};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`

const InfoText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.primaryGreen};
  line-height: 1.5;
`

interface CreateStreamModalProps {
  isOpen: boolean
  onClose: () => void
  recipient: string
  streamService: StreamService
  onStreamCreated: () => void
}

export const CreateStreamModal: React.FC<CreateStreamModalProps> = ({
  isOpen,
  onClose,
  recipient,
  streamService,
  onStreamCreated
}) => {
  const [config, setConfig] = useState<Partial<StreamConfig>>({
    recipient,
    amount: '',
    tokenAddress: '',
    startTime: new Date(Date.now() + 60000), // 1 minute from now
    stopTime: new Date(Date.now() + 3600000), // 1 hour from now
    description: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const allTokens = useAllTokenDetails()

  const createStreamOperation = useAsyncOperation(
    async () => {
      const streamConfig = config as StreamConfig
      await streamService.createStream(streamConfig)
      onStreamCreated()
      onClose()
      resetForm()
    },
    {
      showSuccessMessage: true,
      successMessage: 'Stream created successfully!'
    }
  )

  const resetForm = (): void => {
    setConfig({
      recipient,
      amount: '',
      tokenAddress: '',
      startTime: new Date(Date.now() + 60000),
      stopTime: new Date(Date.now() + 3600000),
      description: ''
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!config.amount || parseFloat(config.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!config.tokenAddress) {
      newErrors.tokenAddress = 'Please select a token'
    }

    if (!config.startTime) {
      newErrors.startTime = 'Start time is required'
    } else if (config.startTime <= new Date()) {
      newErrors.startTime = 'Start time must be in the future'
    }

    if (!config.stopTime) {
      newErrors.stopTime = 'Stop time is required'
    } else if (config.stopTime <= (config.startTime || new Date())) {
      newErrors.stopTime = 'Stop time must be after start time'
    }

    if (!ethers.utils.isAddress(recipient)) {
      newErrors.recipient = 'Invalid recipient address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (validateForm()) {
      createStreamOperation.execute()
    }
  }

  const handleClose = (): void => {
    if (!createStreamOperation.isLoading) {
      resetForm()
      onClose()
    }
  }

  const tokenOptions = Object.entries(allTokens).map(([address, token]) => ({
    address,
    name: token.name,
    symbol: token.symbol
  }))

  const calculateDuration = (): string => {
    if (!config.startTime || !config.stopTime) return ''
    
    const duration = config.stopTime.getTime() - config.startTime.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const calculateRate = (): string => {
    if (!config.amount || !config.startTime || !config.stopTime) return ''
    
    const amount = parseFloat(config.amount)
    const duration = (config.stopTime.getTime() - config.startTime.getTime()) / (1000 * 60 * 60) // hours
    
    if (duration <= 0) return ''
    
    return `${(amount / duration).toFixed(6)} tokens/hour`
  }

  return (
    <Modal isOpen={isOpen} onDismiss={handleClose}>
      <ModalContent>
        <ModalHeader>
          <Title>Create Payment Stream</Title>
          <CloseButton onClick={handleClose} disabled={createStreamOperation.isLoading}>
            <Close />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <InfoBox>
            <InfoText>
              Create a payment stream to automatically transfer tokens over time. 
              The recipient can withdraw at any time, and you can cancel the stream if needed.
            </InfoText>
          </InfoBox>

          <FormGroup>
            <Label>Recipient Address</Label>
            <Input
              type="text"
              value={recipient}
              disabled
              placeholder="0x..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Token</Label>
            <Select
              value={config.tokenAddress}
              onChange={(e) => setConfig(prev => ({ ...prev, tokenAddress: e.target.value }))}
              required
            >
              <option value="">Select a token</option>
              {tokenOptions.map(token => (
                <option key={token.address} value={token.address}>
                  {token.name} ({token.symbol})
                </option>
              ))}
            </Select>
            {errors.tokenAddress && <ErrorMessage>{errors.tokenAddress}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.000001"
              min="0"
              value={config.amount}
              onChange={(e) => setConfig(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.0"
              required
            />
            {errors.amount && <ErrorMessage>{errors.amount}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Start Time</Label>
            <DateTimeContainer>
              <DateTimePicker
                onChange={(date) => setConfig(prev => ({ ...prev, startTime: date || new Date() }))}
                value={config.startTime}
                minDate={new Date()}
                required
              />
            </DateTimeContainer>
            {errors.startTime && <ErrorMessage>{errors.startTime}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Stop Time</Label>
            <DateTimeContainer>
              <DateTimePicker
                onChange={(date) => setConfig(prev => ({ ...prev, stopTime: date || new Date() }))}
                value={config.stopTime}
                minDate={config.startTime || new Date()}
                required
              />
            </DateTimeContainer>
            {errors.stopTime && <ErrorMessage>{errors.stopTime}</ErrorMessage>}
          </FormGroup>

          {config.startTime && config.stopTime && (
            <InfoBox>
              <InfoText>
                <strong>Duration:</strong> {calculateDuration()}<br />
                <strong>Rate:</strong> {calculateRate()}
              </InfoText>
            </InfoBox>
          )}

          <FormGroup>
            <Label>Description (Optional)</Label>
            <TextArea
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What is this payment for?"
              maxLength={500}
            />
          </FormGroup>

          <ButtonContainer>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={createStreamOperation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStreamOperation.isLoading}
            >
              {createStreamOperation.isLoading && <LoadingSpinner size={16} />}
              Create Stream
            </Button>
          </ButtonContainer>
        </Form>
      </ModalContent>
    </Modal>
  )
}

export default CreateStreamModal