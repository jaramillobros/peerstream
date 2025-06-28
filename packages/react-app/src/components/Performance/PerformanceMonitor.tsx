import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkLatency: number
  errorRate: number
}

const MonitorContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.8rem;
  z-index: 1000;
  min-width: 200px;
  display: ${process.env.NODE_ENV === 'development' ? 'block' : 'none'};
`

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
`

const MetricLabel = styled.span`
  color: #ccc;
`

const MetricValue = styled.span<{ warning?: boolean }>`
  color: ${({ warning }) => warning ? '#ff6b6b' : '#4ecdc4'};
  font-weight: bold;
`

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    errorRate: 0
  })

  useEffect(() => {
    const updateMetrics = (): void => {
      // Get performance metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      
      // Memory usage (if available)
      const memory = (performance as any).memory
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0
      
      // Network latency approximation
      const networkLatency = navigation.responseStart - navigation.requestStart
      
      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(performance.now()),
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        networkLatency: Math.round(networkLatency),
        errorRate: 0 // Would be calculated from error tracking
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number): string => {
    return `${bytes} MB`
  }

  const formatMs = (ms: number): string => {
    return `${ms}ms`
  }

  return (
    <MonitorContainer>
      <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Performance</div>
      <MetricRow>
        <MetricLabel>Load Time:</MetricLabel>
        <MetricValue warning={metrics.loadTime > 3000}>
          {formatMs(metrics.loadTime)}
        </MetricValue>
      </MetricRow>
      <MetricRow>
        <MetricLabel>Memory:</MetricLabel>
        <MetricValue warning={metrics.memoryUsage > 100}>
          {formatBytes(metrics.memoryUsage)}
        </MetricValue>
      </MetricRow>
      <MetricRow>
        <MetricLabel>Network:</MetricLabel>
        <MetricValue warning={metrics.networkLatency > 1000}>
          {formatMs(metrics.networkLatency)}
        </MetricValue>
      </MetricRow>
      <MetricRow>
        <MetricLabel>Errors:</MetricLabel>
        <MetricValue warning={metrics.errorRate > 0}>
          {metrics.errorRate}%
        </MetricValue>
      </MetricRow>
    </MonitorContainer>
  )
}

export default PerformanceMonitor