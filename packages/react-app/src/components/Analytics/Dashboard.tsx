import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useAppSelector } from '../../hooks/useRedux'
import { formatEthBalance } from '../../utils'
import LoadingSpinner from '../common/LoadingSpinner'

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
`

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${({ theme }) => theme.primaryGreen};
`

const MetricTitle = styled.h3`
  color: ${({ theme }) => theme.primaryGreen};
  margin: 0 0 1rem 0;
  font-family: Ubuntu;
  font-size: 1.1rem;
`

const MetricValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primaryGreen};
  margin-bottom: 0.5rem;
`

const MetricChange = styled.div<{ positive: boolean }>`
  font-size: 0.9rem;
  color: ${({ positive }) => positive ? '#28a745' : '#dc3545'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const ChartContainer = styled.div`
  grid-column: 1 / -1;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const ChartTitle = styled.h3`
  color: ${({ theme }) => theme.primaryGreen};
  margin: 0 0 2rem 0;
  font-family: Ubuntu;
`

interface AnalyticsData {
  totalEarnings: number
  totalSpent: number
  activeStreams: number
  completedJobs: number
  averageRating: number
  earningsChange: number
  streamsChange: number
}

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { totalEarnings, totalSpent, activeStreams } = useAppSelector(state => state.streams)
  const { completedJobs, reputation } = useAppSelector(state => state.user)

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchAnalytics = async (): Promise<void> => {
      setLoading(true)
      
      // Mock data - in real app, this would come from API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAnalytics({
        totalEarnings,
        totalSpent,
        activeStreams: activeStreams.length,
        completedJobs,
        averageRating: reputation,
        earningsChange: 12.5,
        streamsChange: 8.3
      })
      
      setLoading(false)
    }

    fetchAnalytics()
  }, [totalEarnings, totalSpent, activeStreams.length, completedJobs, reputation])

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner size={48} />
      </DashboardContainer>
    )
  }

  if (!analytics) return null

  return (
    <DashboardContainer>
      <MetricCard>
        <MetricTitle>Total Earnings</MetricTitle>
        <MetricValue>{formatEthBalance(analytics.totalEarnings)} ETH</MetricValue>
        <MetricChange positive={analytics.earningsChange > 0}>
          {analytics.earningsChange > 0 ? '↗' : '↘'} {Math.abs(analytics.earningsChange)}% this month
        </MetricChange>
      </MetricCard>

      <MetricCard>
        <MetricTitle>Active Streams</MetricTitle>
        <MetricValue>{analytics.activeStreams}</MetricValue>
        <MetricChange positive={analytics.streamsChange > 0}>
          {analytics.streamsChange > 0 ? '↗' : '↘'} {Math.abs(analytics.streamsChange)}% this week
        </MetricChange>
      </MetricCard>

      <MetricCard>
        <MetricTitle>Completed Jobs</MetricTitle>
        <MetricValue>{analytics.completedJobs}</MetricValue>
        <MetricChange positive={true}>
          ↗ All time
        </MetricChange>
      </MetricCard>

      <MetricCard>
        <MetricTitle>Average Rating</MetricTitle>
        <MetricValue>{analytics.averageRating.toFixed(1)}/5.0</MetricValue>
        <MetricChange positive={analytics.averageRating >= 4}>
          {'★'.repeat(Math.floor(analytics.averageRating))} Based on {analytics.completedJobs} reviews
        </MetricChange>
      </MetricCard>

      <ChartContainer>
        <ChartTitle>Earnings Over Time</ChartTitle>
        {/* Chart component would go here */}
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
          Chart visualization coming soon...
        </div>
      </ChartContainer>
    </DashboardContainer>
  )
}

export default Dashboard