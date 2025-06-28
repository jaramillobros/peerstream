import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Stream, StreamConfig, LoadingState } from '../../types'

interface StreamState extends LoadingState {
  streams: Stream[]
  activeStreams: Stream[]
  streamHistory: Stream[]
  totalEarnings: number
  totalSpent: number
}

const initialState: StreamState = {
  streams: [],
  activeStreams: [],
  streamHistory: [],
  totalEarnings: 0,
  totalSpent: 0,
  isLoading: false,
  error: undefined
}

export const createStream = createAsyncThunk(
  'streams/create',
  async (config: StreamConfig) => {
    const response = await fetch('/api/streams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return response.json()
  }
)

export const fetchUserStreams = createAsyncThunk(
  'streams/fetchUserStreams',
  async (userAddress: string) => {
    const response = await fetch(`/api/streams/user/${userAddress}`)
    return response.json()
  }
)

export const withdrawFromStream = createAsyncThunk(
  'streams/withdraw',
  async ({ streamId, amount }: { streamId: string; amount?: string }) => {
    const response = await fetch(`/api/streams/${streamId}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    return response.json()
  }
)

const streamSlice = createSlice({
  name: 'streams',
  initialState,
  reducers: {
    addStream: (state, action: PayloadAction<Stream>) => {
      state.streams.push(action.payload)
      if (action.payload.isActive) {
        state.activeStreams.push(action.payload)
      }
    },
    updateStream: (state, action: PayloadAction<Stream>) => {
      const index = state.streams.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.streams[index] = action.payload
      }
      
      const activeIndex = state.activeStreams.findIndex(s => s.id === action.payload.id)
      if (action.payload.isActive && activeIndex === -1) {
        state.activeStreams.push(action.payload)
      } else if (!action.payload.isActive && activeIndex !== -1) {
        state.activeStreams.splice(activeIndex, 1)
        state.streamHistory.push(action.payload)
      }
    },
    removeStream: (state, action: PayloadAction<string>) => {
      state.streams = state.streams.filter(s => s.id !== action.payload)
      state.activeStreams = state.activeStreams.filter(s => s.id !== action.payload)
    },
    updateEarnings: (state, action: PayloadAction<number>) => {
      state.totalEarnings += action.payload
    },
    updateSpent: (state, action: PayloadAction<number>) => {
      state.totalSpent += action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStream.pending, (state) => {
        state.isLoading = true
        state.error = undefined
      })
      .addCase(createStream.fulfilled, (state, action) => {
        state.isLoading = false
        state.streams.push(action.payload)
        state.activeStreams.push(action.payload)
      })
      .addCase(createStream.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
      .addCase(fetchUserStreams.fulfilled, (state, action) => {
        state.streams = action.payload
        state.activeStreams = action.payload.filter((s: Stream) => s.isActive)
        state.streamHistory = action.payload.filter((s: Stream) => !s.isActive)
      })
  }
})

export const { 
  addStream, 
  updateStream, 
  removeStream, 
  updateEarnings, 
  updateSpent 
} = streamSlice.actions

export default streamSlice.reducer