import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import userSlice from './slices/userSlice'
import streamSlice from './slices/streamSlice'
import chatSlice from './slices/chatSlice'
import visionSlice from './slices/visionSlice'
import notificationSlice from './slices/notificationSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'vision'] // Only persist user and vision data
}

const rootReducer = combineReducers({
  user: userSlice,
  streams: streamSlice,
  chat: chatSlice,
  vision: visionSlice,
  notifications: notificationSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch