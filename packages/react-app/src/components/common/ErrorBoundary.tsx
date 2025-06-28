import React, { Component, ErrorInfo, ReactNode } from 'react'
import styled from 'styled-components'

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.tertiaryGreen};
  border-radius: 8px;
  margin: 1rem;
`

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.primaryGreen};
  margin-bottom: 1rem;
  font-family: Ubuntu;
`

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 1.5rem;
  max-width: 600px;
  line-height: 1.6;
`

const RetryButton = styled.button`
  background: ${({ theme }) => theme.primaryGreen};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-family: Ubuntu;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.secondaryGreen};
  }
`

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Here you could send error reports to a service like Sentry
    // reportError(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
          </ErrorMessage>
          {this.state.error && process.env.NODE_ENV === 'development' && (
            <details style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <summary>Error details (development only)</summary>
              <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <RetryButton onClick={this.handleRetry}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary