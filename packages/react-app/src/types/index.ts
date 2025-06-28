import { BigNumber } from 'ethers'

export interface User {
  address: string
  name?: string
  email?: string
  avatar?: string
  bio?: string
  skills?: string[]
  hourlyRate?: number
  isVerified?: boolean
}

export interface Peer {
  postId: string
  address: string
  message: string
  profile?: User
  rating?: number
  completedJobs?: number
}

export interface Stream {
  id: string
  sender: string
  recipient: string
  deposit: BigNumber
  tokenAddress: string
  startTime: number
  stopTime: number
  remainingBalance: BigNumber
  ratePerSecond: BigNumber
  isActive: boolean
}

export interface ChatMessage {
  id: string
  sender: string
  recipient: string
  message: string
  timestamp: number
  isEncrypted: boolean
}

export interface ChatThread {
  id: string
  participants: string[]
  messages: ChatMessage[]
  lastActivity: number
  isConfidential: boolean
}

export interface StreamConfig {
  recipient: string
  amount: string
  tokenAddress: string
  startTime: Date
  stopTime: Date
  description?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: number
}

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface AppState {
  user: User | null
  peers: Peer[]
  streams: Stream[]
  chatThreads: ChatThread[]
  loading: Record<string, LoadingState>
}

export enum StreamStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum UserRole {
  CLIENT = 'client',
  PROVIDER = 'provider',
  BOTH = 'both'
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}