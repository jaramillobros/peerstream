import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { ChatMessage } from '../../types'
import { ChatService } from '../../services/chatService'
import { useAsyncOperation } from '../../hooks/useAsyncOperation'
import { sanitizeInput } from '../../utils/validation'
import LoadingSpinner from '../common/LoadingSpinner'

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  background: ${({ theme }) => theme.tertiaryGreen};
  border-radius: 8px;
  overflow: hidden;
`

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.placeholderGray};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primaryGreen};
    border-radius: 3px;
  }
`

const MessageBubble = styled.div<{ isOwn: boolean }>`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  word-wrap: break-word;
  align-self: ${({ isOwn }) => isOwn ? 'flex-end' : 'flex-start'};
  
  ${({ isOwn, theme }) => isOwn ? `
    background: ${theme.primaryGreen};
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    background: white;
    color: ${theme.primaryGreen};
    border: 1px solid ${theme.placeholderGray};
    border-bottom-left-radius: 4px;
  `}
`

const MessageText = styled.p`
  margin: 0;
  line-height: 1.4;
  font-family: Ubuntu;
`

const MessageTime = styled.span`
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
  display: block;
`

const InputContainer = styled.div`
  display: flex;
  padding: 1rem;
  background: white;
  border-top: 1px solid ${({ theme }) => theme.placeholderGray};
  gap: 0.75rem;
`

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.placeholderGray};
  border-radius: 20px;
  font-family: Ubuntu;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.primaryGreen};
  }

  &:disabled {
    background: ${({ theme }) => theme.placeholderGray};
    cursor: not-allowed;
  }
`

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.primaryGreen};
  color: white;
  border: none;
  border-radius: 20px;
  font-family: Ubuntu;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.primaryGreen};
  opacity: 0.6;
`

const EmptyStateText = styled.p`
  margin: 0;
  font-family: Ubuntu;
  text-align: center;
`

interface ChatInterfaceProps {
  messages: ChatMessage[]
  threadAddress: string
  chatService: ChatService
  currentUserAddress: string
  recipientAddress: string
  onNewMessage?: (message: ChatMessage) => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  threadAddress,
  chatService,
  currentUserAddress,
  recipientAddress,
  onNewMessage
}) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessageOperation = useAsyncOperation(
    async (message: string) => {
      const sanitizedMessage = sanitizeInput(message)
      await chatService.sendMessage(threadAddress, sanitizedMessage, recipientAddress)
      
      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        sender: currentUserAddress,
        recipient: recipientAddress,
        message: sanitizedMessage,
        timestamp: Math.floor(Date.now() / 1000),
        isEncrypted: true
      }
      
      onNewMessage?.(optimisticMessage)
      setNewMessage('')
    },
    {
      showErrorMessage: true,
      errorMessage: 'Failed to send message'
    }
  )

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || sendMessageOperation.isLoading) return
    
    sendMessageOperation.execute(trimmedMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyStateText>
              No messages yet.<br />
              Start the conversation!
            </EmptyStateText>
          </EmptyState>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender.toLowerCase() === currentUserAddress.toLowerCase()
            
            return (
              <MessageBubble key={message.id} isOwn={isOwn}>
                <MessageText>{message.message}</MessageText>
                <MessageTime>{formatTime(message.timestamp)}</MessageTime>
              </MessageBubble>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <form onSubmit={handleSubmit}>
        <InputContainer>
          <MessageInput
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sendMessageOperation.isLoading}
            maxLength={1000}
          />
          <SendButton
            type="submit"
            disabled={!newMessage.trim() || sendMessageOperation.isLoading}
          >
            {sendMessageOperation.isLoading ? (
              <LoadingSpinner size={16} />
            ) : (
              'Send'
            )}
          </SendButton>
        </InputContainer>
      </form>
    </ChatContainer>
  )
}

export default ChatInterface