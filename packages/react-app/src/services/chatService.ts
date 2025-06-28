import { ChatMessage, ChatThread } from '../types'
import { chatMessageSchema } from '../utils/validation'
import { handleAsyncError, AppError } from '../utils/validation'
import { sanitizeInput, rateLimiter } from '../utils/validation'

export class ChatService {
  constructor(private space: any) {}

  validateMessage = (message: string, recipient: string): void => {
    const result = chatMessageSchema.safeParse({ message, recipient })
    if (!result.success) {
      throw new AppError(
        `Invalid message: ${result.error.issues.map(i => i.message).join(', ')}`,
        'VALIDATION_ERROR'
      )
    }
  }

  sendMessage = handleAsyncError(async (
    threadAddress: string,
    message: string,
    recipient: string
  ): Promise<void> => {
    // Rate limiting
    if (!rateLimiter.isAllowed(`message_${threadAddress}`, 10, 60000)) {
      throw new AppError('Too many messages sent. Please wait before sending another.', 'RATE_LIMITED')
    }

    this.validateMessage(message, recipient)
    
    const sanitizedMessage = sanitizeInput(message)
    
    try {
      const thread = await this.space.joinThreadByAddress(threadAddress)
      await thread.post(sanitizedMessage)
    } catch (error: any) {
      throw new AppError(`Failed to send message: ${error.message}`, 'MESSAGE_SEND_FAILED')
    }
  })

  createThread = handleAsyncError(async (
    threadName: string,
    participantAddress: string
  ): Promise<string> => {
    try {
      const thread = await this.space.createConfidentialThread(threadName)
      await thread.addMember(participantAddress)
      return thread.address
    } catch (error: any) {
      throw new AppError(`Failed to create thread: ${error.message}`, 'THREAD_CREATION_FAILED')
    }
  })

  getMessages = handleAsyncError(async (threadAddress: string): Promise<ChatMessage[]> => {
    try {
      const thread = await this.space.joinThreadByAddress(threadAddress)
      const posts = await thread.getPosts()
      
      return posts.map((post: any, index: number) => ({
        id: `${threadAddress}_${index}`,
        sender: post.author,
        recipient: '', // Will be determined by thread participants
        message: post.message,
        timestamp: post.timestamp,
        isEncrypted: true
      }))
    } catch (error: any) {
      throw new AppError(`Failed to fetch messages: ${error.message}`, 'MESSAGE_FETCH_FAILED')
    }
  })

  subscribeToThread = handleAsyncError(async (
    threadAddress: string,
    onUpdate: (messages: ChatMessage[]) => void
  ): Promise<() => void> => {
    try {
      const thread = await this.space.joinThreadByAddress(threadAddress)
      
      const updateHandler = async () => {
        const messages = await this.getMessages(threadAddress)
        onUpdate(messages)
      }

      await thread.onUpdate(updateHandler)
      
      // Return unsubscribe function
      return () => {
        // 3Box doesn't provide a direct unsubscribe method
        // This is a limitation of the current 3Box API
      }
    } catch (error: any) {
      throw new AppError(`Failed to subscribe to thread: ${error.message}`, 'SUBSCRIPTION_FAILED')
    }
  })

  markAsRead = handleAsyncError(async (threadAddress: string): Promise<void> => {
    // This would typically update a read status in the thread metadata
    // Implementation depends on how read status is tracked
    try {
      // Placeholder for read status implementation
      console.log(`Marking thread ${threadAddress} as read`)
    } catch (error: any) {
      throw new AppError(`Failed to mark as read: ${error.message}`, 'MARK_READ_FAILED')
    }
  })

  getUnreadCount = handleAsyncError(async (threadAddress: string): Promise<number> => {
    // This would calculate unread messages based on last read timestamp
    // Implementation depends on how read status is tracked
    try {
      // Placeholder for unread count implementation
      return 0
    } catch (error: any) {
      throw new AppError(`Failed to get unread count: ${error.message}`, 'UNREAD_COUNT_FAILED')
    }
  })
}