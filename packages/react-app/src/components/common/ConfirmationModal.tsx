import React from 'react'
import styled from 'styled-components'
import Modal from '../Modal'

const ModalContent = styled.div`
  padding: 2rem;
  text-align: center;
`

const Title = styled.h3`
  color: ${({ theme }) => theme.primaryGreen};
  margin-bottom: 1rem;
  font-family: Ubuntu;
`

const Message = styled.p`
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 2rem;
  line-height: 1.6;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-family: Ubuntu;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  ${({ variant, theme }) => variant === 'primary' ? `
    background: ${theme.primaryGreen};
    color: white;
    &:hover {
      background: ${theme.secondaryGreen};
    }
  ` : `
    background: transparent;
    color: ${theme.primaryGreen};
    border: 1px solid ${theme.primaryGreen};
    &:hover {
      background: ${theme.tertiaryGreen};
    }
  `}
`

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onDismiss={onClose}>
      <ModalContent>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ButtonContainer>
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant="primary" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmationModal