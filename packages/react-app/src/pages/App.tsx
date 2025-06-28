import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import Web3ReactManager from '../components/Web3ReactManager'
import ErrorBoundary from '../components/common/ErrorBoundary'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Home } from './Home'
import { Discover } from './Discover'
import { Meeting } from './Meeting'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: 100vh;
  background: ${({ theme }) => theme.backgroundColor};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.backgroundColor};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const FooterWrapper = styled.div`
  width: 100%;
  min-height: 60px;
  margin-top: auto;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`

const LoadingText = styled.p`
  color: ${({ theme }) => theme.primaryGreen};
  font-family: Ubuntu;
  font-size: 1.1rem;
`

const SuspenseFallback: React.FC = () => (
  <LoadingContainer>
    <LoadingSpinner size={48} />
    <LoadingText>Loading...</LoadingText>
  </LoadingContainer>
)

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { active } = useWeb3React()
  
  if (!active) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

export default function App(): JSX.Element {
  const context = useWeb3React()

  // Log connection status for debugging
  React.useEffect(() => {
    if (!context.active && !context.error) {
      console.log('Web3 loading...')
    } else if (context.error) {
      console.error('Web3 connection error:', context.error)
    } else {
      console.log('Web3 connected successfully:', {
        account: context.account,
        chainId: context.chainId
      })
    }
  }, [context])

  return (
    <ErrorBoundary>
      <Suspense fallback={<SuspenseFallback />}>
        <AppWrapper>
          <BrowserRouter>
            <HeaderWrapper>
              <Header />
            </HeaderWrapper>
            
            <BodyWrapper>
              <Web3ReactManager>
                <ErrorBoundary>
                  <Suspense fallback={<SuspenseFallback />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/home" element={<Home />} />
                      <Route 
                        path="/discover" 
                        element={
                          <ProtectedRoute>
                            <Discover />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/meeting" element={<Meeting />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </Web3ReactManager>
            </BodyWrapper>
            
            <FooterWrapper>
              <Footer />
            </FooterWrapper>
          </BrowserRouter>
        </AppWrapper>
      </Suspense>
    </ErrorBoundary>
  )
}