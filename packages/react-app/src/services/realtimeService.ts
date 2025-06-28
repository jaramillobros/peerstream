import { EventEmitter } from 'events'
import { apiService } from './apiService'
import { Stream, ChatMessage } from '../types'

export enum RealtimeEvents {
  STREAM_UPDATED = 'stream_updated',
  NEW_MESSAGE = 'new_message',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  PAYMENT_RECEIVED = 'payment_received',
  STREAM_STARTED = 'stream_started',
  STREAM_ENDED = 'stream_ended'
}

class RealtimeService extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect = (): void => {
    try {
      this.ws = apiService.createWebSocket('/ws')
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.attemptReconnect()
    }
  }

  disconnect = (): void => {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private handleMessage = (data: any): void => {
    switch (data.type) {
      case 'stream_update':
        this.emit(RealtimeEvents.STREAM_UPDATED, data.payload as Stream)
        break
      case 'new_message':
        this.emit(RealtimeEvents.NEW_MESSAGE, data.payload as ChatMessage)
        break
      case 'user_status':
        if (data.payload.status === 'online') {
          this.emit(RealtimeEvents.USER_ONLINE, data.payload.userId)
        } else {
          this.emit(RealtimeEvents.USER_OFFLINE, data.payload.userId)
        }
        break
      case 'payment_received':
        this.emit(RealtimeEvents.PAYMENT_RECEIVED, data.payload)
        break
      case 'stream_started':
        this.emit(RealtimeEvents.STREAM_STARTED, data.payload)
        break
      case 'stream_ended':
        this.emit(RealtimeEvents.STREAM_ENDED, data.payload)
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  private attemptReconnect = (): void => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  sendMessage = (type: string, payload: any): void => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    } else {
      console.warn('WebSocket not connected, message not sent')
    }
  }

  // Subscribe to stream updates
  subscribeToStream = (streamId: string): void => {
    this.sendMessage('subscribe_stream', { streamId })
  }

  // Unsubscribe from stream updates
  unsubscribeFromStream = (streamId: string): void => {
    this.sendMessage('unsubscribe_stream', { streamId })
  }

  // Join chat room
  joinChatRoom = (roomId: string): void => {
    this.sendMessage('join_room', { roomId })
  }

  // Leave chat room
  leaveChatRoom = (roomId: string): void => {
    this.sendMessage('leave_room', { roomId })
  }
}

export const realtimeService = new RealtimeService()
export default realtimeService