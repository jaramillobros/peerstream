import React, { useState } from 'react'
import styled from 'styled-components'
import { useAppSelector } from '../../hooks/useRedux'
import { PlatformVision } from '../../types/visions'
import VisionSelector from '../../components/VisionSelector'
import Dashboard from '../../components/Analytics/Dashboard'
import StreamCard from '../../components/Stream/StreamCard'
import CreateStreamModal from '../../components/Stream/CreateStreamModal'
import { StreamService } from '../../services/streamService'
import { useContract } from '../../hooks'
import { useWeb3React } from '@web3-react/core'

const DashboardContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.backgroundColor};
  padding: 2rem;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  color: ${({ theme }) => theme.primaryGreen};
  font-family: Ubuntu;
  margin: 0;
`

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.placeholderGray};
`

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${({ active, theme }) => active ? theme.primaryGreen : 'transparent'};
  color: ${({ active, theme }) => active ? theme.primaryGreen : theme.textColor};
  font-family: Ubuntu;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.primaryGreen};
  }
`

const StreamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
`

const CreateStreamButton = styled.button`
  background: ${({ theme }) => theme.primaryGreen};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-family: Ubuntu;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.secondaryGreen};
  }
`

enum DashboardTab {
  OVERVIEW = 'overview',
  STREAMS = 'streams',
  EARNINGS = 'earnings',
  SETTINGS = 'settings'
}

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.OVERVIEW)
  const [showCreateStream, setShowCreateStream] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  
  const { account, library } = useWeb3React()
  const sablierContract = useContract("Sablier")
  const { currentVision } = useAppSelector(state => state.vision)
  const { streams, activeStreams } = useAppSelector(state => state.streams)

  const streamService = new StreamService(sablierContract!, library!)

  const handleVisionChange = (vision: PlatformVision): void => {
    // Dispatch vision change action
    console.log('Vision changed to:', vision)
  }

  const handleStreamUpdate = (): void => {
    // Refresh streams data
    console.log('Refreshing streams...')
  }

  const renderTabContent = (): React.ReactNode => {
    switch (activeTab) {
      case DashboardTab.OVERVIEW:
        return <Dashboard />
      
      case DashboardTab.STREAMS:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#155E63', fontFamily: 'Ubuntu' }}>Your Streams</h2>
              <CreateStreamButton onClick={() => setShowCreateStream(true)}>
                Create New Stream
              </CreateStreamButton>
            </div>
            <StreamsGrid>
              {streams.map(stream => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  streamService={streamService}
                  onStreamUpdate={handleStreamUpdate}
                  currentUserAddress={account || ''}
                />
              ))}
            </StreamsGrid>
          </div>
        )
      
      case DashboardTab.EARNINGS:
        return (
          <div>
            <h2 style={{ color: '#155E63', fontFamily: 'Ubuntu' }}>Earnings Analytics</h2>
            {/* Earnings analytics component would go here */}
          </div>
        )
      
      case DashboardTab.SETTINGS:
        return (
          <div>
            <h2 style={{ color: '#155E63', fontFamily: 'Ubuntu' }}>Platform Settings</h2>
            <VisionSelector
              currentVision={currentVision}
              onVisionChange={handleVisionChange}
            />
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Dashboard</Title>
      </Header>

      <TabContainer>
        <Tab 
          active={activeTab === DashboardTab.OVERVIEW}
          onClick={() => setActiveTab(DashboardTab.OVERVIEW)}
        >
          Overview
        </Tab>
        <Tab 
          active={activeTab === DashboardTab.STREAMS}
          onClick={() => setActiveTab(DashboardTab.STREAMS)}
        >
          Streams
        </Tab>
        <Tab 
          active={activeTab === DashboardTab.EARNINGS}
          onClick={() => setActiveTab(DashboardTab.EARNINGS)}
        >
          Earnings
        </Tab>
        <Tab 
          active={activeTab === DashboardTab.SETTINGS}
          onClick={() => setActiveTab(DashboardTab.SETTINGS)}
        >
          Settings
        </Tab>
      </TabContainer>

      {renderTabContent()}

      {showCreateStream && (
        <CreateStreamModal
          isOpen={showCreateStream}
          onClose={() => setShowCreateStream(false)}
          recipient={selectedRecipient}
          streamService={streamService}
          onStreamCreated={handleStreamUpdate}
        />
      )}
    </DashboardContainer>
  )
}

export default DashboardPage