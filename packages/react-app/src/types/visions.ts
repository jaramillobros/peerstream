export enum PlatformVision {
  LEARNING = 'learning',
  DEV_TASKS = 'dev_tasks', 
  TELEHEALTH = 'telehealth',
  LIVE_PERFORMANCE = 'live_performance'
}

export interface LearningSession {
  id: string
  instructor: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  price: number
  maxStudents: number
  currentStudents: number
  startTime: Date
  isLive: boolean
  recordingUrl?: string
  materials: string[]
  prerequisites: string[]
}

export interface DevTask {
  id: string
  client: string
  title: string
  description: string
  techStack: string[]
  complexity: 'simple' | 'medium' | 'complex'
  estimatedHours: number
  hourlyRate: number
  deadline: Date
  status: 'open' | 'in_progress' | 'review' | 'completed'
  requirements: string[]
  deliverables: string[]
  codeRepoUrl?: string
}

export interface HealthConsultation {
  id: string
  doctor: string
  patient: string
  specialty: string
  symptoms: string[]
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  duration: number
  price: number
  scheduledTime: Date
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  prescriptions?: string[]
  followUpRequired: boolean
  medicalRecordHash?: string
}

export interface LivePerformance {
  id: string
  performer: string
  title: string
  description: string
  category: 'music' | 'art' | 'comedy' | 'education' | 'gaming' | 'other'
  startTime: Date
  duration: number
  isLive: boolean
  viewerCount: number
  totalTips: number
  streamUrl: string
  chatEnabled: boolean
  recordingEnabled: boolean
}

export interface PlatformConfig {
  vision: PlatformVision
  features: {
    streaming: boolean
    chat: boolean
    fileSharing: boolean
    screenShare: boolean
    recording: boolean
    tipping: boolean
    scheduling: boolean
    verification: boolean
  }
  paymentMethods: {
    perMinute: boolean
    perSession: boolean
    subscription: boolean
    tips: boolean
  }
}