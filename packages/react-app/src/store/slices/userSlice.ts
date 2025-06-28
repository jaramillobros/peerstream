import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, LoadingState } from '../../types'

interface UserState extends LoadingState {
  currentUser: User | null
  profile: User | null
  isAuthenticated: boolean
  reputation: number
  earnings: number
  completedJobs: number
}

const initialState: UserState = {
  currentUser: null,
  profile: null,
  isAuthenticated: false,
  reputation: 0,
  earnings: 0,
  completedJobs: 0,
  isLoading: false,
  error: undefined
}

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (address: string) => {
    // Implementation for fetching user profile from 3Box
    const response = await fetch(`/api/users/${address}`)
    return response.json()
  }
)

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<User>) => {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    })
    return response.json()
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
      state.isAuthenticated = true
    },
    clearUser: (state) => {
      state.currentUser = null
      state.profile = null
      state.isAuthenticated = false
      state.reputation = 0
      state.earnings = 0
      state.completedJobs = 0
    },
    updateReputation: (state, action: PayloadAction<number>) => {
      state.reputation = action.payload
    },
    incrementEarnings: (state, action: PayloadAction<number>) => {
      state.earnings += action.payload
    },
    incrementCompletedJobs: (state) => {
      state.completedJobs += 1
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = undefined
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...action.payload }
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
  }
})

export const { 
  setCurrentUser, 
  clearUser, 
  updateReputation, 
  incrementEarnings, 
  incrementCompletedJobs 
} = userSlice.actions

export default userSlice.reducer