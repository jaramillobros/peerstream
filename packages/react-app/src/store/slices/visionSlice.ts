import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlatformVision, PlatformConfig } from '../../types/visions'

interface VisionState {
  currentVision: PlatformVision
  config: PlatformConfig
  availableVisions: PlatformVision[]
}

const initialState: VisionState = {
  currentVision: PlatformVision.LEARNING,
  config: {
    vision: PlatformVision.LEARNING,
    features: {
      streaming: true,
      chat: true,
      fileSharing: true,
      screenShare: true,
      recording: true,
      tipping: true,
      scheduling: true,
      verification: true
    },
    paymentMethods: {
      perMinute: true,
      perSession: true,
      subscription: true,
      tips: true
    }
  },
  availableVisions: [
    PlatformVision.LEARNING,
    PlatformVision.DEV_TASKS,
    PlatformVision.TELEHEALTH,
    PlatformVision.LIVE_PERFORMANCE
  ]
}

const visionSlice = createSlice({
  name: 'vision',
  initialState,
  reducers: {
    setVision: (state, action: PayloadAction<PlatformVision>) => {
      state.currentVision = action.payload
      state.config.vision = action.payload
    },
    updateConfig: (state, action: PayloadAction<Partial<PlatformConfig>>) => {
      state.config = { ...state.config, ...action.payload }
    },
    toggleFeature: (state, action: PayloadAction<keyof PlatformConfig['features']>) => {
      state.config.features[action.payload] = !state.config.features[action.payload]
    }
  }
})

export const { setVision, updateConfig, toggleFeature } = visionSlice.actions
export default visionSlice.reducer