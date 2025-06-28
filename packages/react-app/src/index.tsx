import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ethers } from 'ethers'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import ApolloClient from "apollo-boost"
import { ApolloProvider } from "@apollo/react-hooks"
import { NetworkContextName } from './constants'
import ThemeProvider, { GlobalStyle } from './theme'
import { types, transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import { store, persistor } from './store'
import App from './pages/App'
import SecurityProvider from './components/Security/SecurityProvider'
import PerformanceMonitor from './components/Performance/PerformanceMonitor'
import ErrorBoundary from './components/common/ErrorBoundary'
import LoadingSpinner from './components/common/LoadingSpinner'
import { PerformanceTracker, trackWebVitals } from './utils/performance'
import { realtimeService } from './services/realtimeService'
import "./index.css"

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

function getLibrary(provider: any): ethers.providers.Web3Provider {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 10000
  return library
}

// Alert configuration
const alertOptions = {
  position: positions.TOP_CENTER,
  timeout: 5000,
  offset: '30px',
  type: types.INFO,
  transition: transitions.SCALE
}

// Apollo Client configuration
const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URL || "https://api.thegraph.com/subgraphs/name/sablierhq/sablier",
})

// Performance tracking
const performanceTracker = PerformanceTracker.getInstance()
performanceTracker.startTracking()

// Track Web Vitals
trackWebVitals((metric) => {
  console.log('Web Vital:', metric)
  // In production, send to analytics service
})

// Initialize realtime service
realtimeService.connect()

// Loading component for PersistGate
const PersistGateLoading: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <LoadingSpinner size={48} />
    <p style={{ fontFamily: 'Ubuntu', color: '#155E63' }}>Loading your data...</p>
  </div>
)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<PersistGateLoading />} persistor={persistor}>
          <Web3ReactProvider getLibrary={getLibrary}>
            <Web3ProviderNetwork getLibrary={getLibrary}>
              <SecurityProvider>
                <ThemeProvider>
                  <GlobalStyle />
                  <ApolloProvider client={client}>
                    <AlertProvider template={AlertTemplate} {...alertOptions}>
                      <App />
                      <PerformanceMonitor />
                    </AlertProvider>
                  </ApolloProvider>
                </ThemeProvider>
              </SecurityProvider>
            </Web3ProviderNetwork>
          </Web3ReactProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)

// Cleanup on unmount
window.addEventListener('beforeunload', () => {
  performanceTracker.cleanup()
  realtimeService.disconnect()
})