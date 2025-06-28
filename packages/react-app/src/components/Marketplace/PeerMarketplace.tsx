import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useAppSelector } from '../../hooks/useRedux'
import { PlatformVision } from '../../types/visions'
import { Peer, User } from '../../types'
import PeerCard from '../PeerCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { useAsyncOperation } from '../../hooks/useAsyncOperation'

const MarketplaceContainer = styled.div`
  width: 100%;
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

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.placeholderGray};
  border-radius: 6px;
  font-family: Ubuntu;
  background: white;
  color: ${({ theme }) => theme.primaryGreen};
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primaryGreen};
  }
`

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.placeholderGray};
  border-radius: 6px;
  font-family: Ubuntu;
  background: white;
  color: ${({ theme }) => theme.primaryGreen};
  min-width: 300px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primaryGreen};
  }
`

const PeersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.primaryGreen};
`

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primaryGreen};
  margin-bottom: 0.5rem;
`

const StatLabel = styled.div`
  color: ${({ theme }) => theme.textColor};
  font-size: 0.9rem;
`

interface MarketplaceFilters {
  category: string
  priceRange: string
  rating: string
  availability: string
  search: string
}

export const PeerMarketplace: React.FC = () => {
  const [peers, setPeers] = useState<Peer[]>([])
  const [filteredPeers, setFilteredPeers] = useState<Peer[]>([])
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: 'all',
    priceRange: 'all',
    rating: 'all',
    availability: 'all',
    search: ''
  })

  const { currentVision } = useAppSelector(state => state.vision)

  const fetchPeersOperation = useAsyncOperation(
    async () => {
      // Mock data - in real app, this would come from API
      const mockPeers: Peer[] = [
        {
          postId: '1',
          address: '0x1234567890123456789012345678901234567890',
          message: 'React expert with 5+ years experience. Available for code reviews and mentoring.',
          profile: {
            address: '0x1234567890123456789012345678901234567890',
            name: 'Alice Johnson',
            bio: 'Senior Frontend Developer specializing in React and TypeScript',
            skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
            hourlyRate: 75,
            isVerified: true
          },
          rating: 4.8,
          completedJobs: 127
        },
        {
          postId: '2',
          address: '0x2345678901234567890123456789012345678901',
          message: 'Blockchain developer and smart contract auditor. DeFi specialist.',
          profile: {
            address: '0x2345678901234567890123456789012345678901',
            name: 'Bob Smith',
            bio: 'Blockchain architect with expertise in Ethereum and Solidity',
            skills: ['Solidity', 'Web3', 'DeFi', 'Security Audits'],
            hourlyRate: 120,
            isVerified: true
          },
          rating: 4.9,
          completedJobs: 89
        }
      ]
      
      setPeers(mockPeers)
      return mockPeers
    },
    {
      showErrorMessage: true,
      errorMessage: 'Failed to load peers'
    }
  )

  useEffect(() => {
    fetchPeersOperation.execute()
  }, [currentVision])

  useEffect(() => {
    // Apply filters
    let filtered = peers

    if (filters.search) {
      filtered = filtered.filter(peer => 
        peer.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        peer.profile?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        peer.profile?.skills?.some(skill => 
          skill.toLowerCase().includes(filters.search.toLowerCase())
        )
      )
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(peer => 
        peer.profile?.skills?.some(skill => 
          skill.toLowerCase().includes(filters.category.toLowerCase())
        )
      )
    }

    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(peer => {
        const rate = peer.profile?.hourlyRate || 0
        return rate >= min && (max ? rate <= max : true)
      })
    }

    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating)
      filtered = filtered.filter(peer => (peer.rating || 0) >= minRating)
    }

    setFilteredPeers(filtered)
  }, [peers, filters])

  const handleFilterChange = (key: keyof MarketplaceFilters, value: string): void => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getVisionTitle = (): string => {
    switch (currentVision) {
      case PlatformVision.LEARNING:
        return 'Find Learning Mentors'
      case PlatformVision.DEV_TASKS:
        return 'Find Developers'
      case PlatformVision.TELEHEALTH:
        return 'Find Healthcare Providers'
      case PlatformVision.LIVE_PERFORMANCE:
        return 'Find Performers'
      default:
        return 'Find Peers'
    }
  }

  const getCategories = (): string[] => {
    switch (currentVision) {
      case PlatformVision.LEARNING:
        return ['Programming', 'Design', 'Business', 'Marketing', 'Data Science']
      case PlatformVision.DEV_TASKS:
        return ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Blockchain']
      case PlatformVision.TELEHEALTH:
        return ['General Practice', 'Cardiology', 'Dermatology', 'Mental Health', 'Pediatrics']
      case PlatformVision.LIVE_PERFORMANCE:
        return ['Music', 'Art', 'Comedy', 'Education', 'Gaming']
      default:
        return ['Technology', 'Business', 'Creative', 'Health', 'Education']
    }
  }

  const calculateStats = () => {
    const totalPeers = peers.length
    const averageRating = peers.reduce((sum, peer) => sum + (peer.rating || 0), 0) / totalPeers
    const totalJobs = peers.reduce((sum, peer) => sum + (peer.completedJobs || 0), 0)
    const averageRate = peers.reduce((sum, peer) => sum + (peer.profile?.hourlyRate || 0), 0) / totalPeers

    return { totalPeers, averageRating, totalJobs, averageRate }
  }

  const stats = calculateStats()

  if (fetchPeersOperation.isLoading) {
    return (
      <MarketplaceContainer>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <LoadingSpinner size={48} />
        </div>
      </MarketplaceContainer>
    )
  }

  return (
    <MarketplaceContainer>
      <Header>
        <Title>{getVisionTitle()}</Title>
      </Header>

      <StatsContainer>
        <StatCard>
          <StatValue>{stats.totalPeers}</StatValue>
          <StatLabel>Available Peers</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.averageRating.toFixed(1)}</StatValue>
          <StatLabel>Average Rating</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalJobs}</StatValue>
          <StatLabel>Jobs Completed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>${Math.round(stats.averageRate)}</StatValue>
          <StatLabel>Average Rate/Hour</StatLabel>
        </StatCard>
      </StatsContainer>

      <FilterContainer>
        <SearchInput
          type="text"
          placeholder="Search by name, skills, or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        
        <FilterSelect
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="all">All Categories</option>
          {getCategories().map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          value={filters.priceRange}
          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
        >
          <option value="all">All Prices</option>
          <option value="0-50">$0 - $50/hr</option>
          <option value="50-100">$50 - $100/hr</option>
          <option value="100-200">$100 - $200/hr</option>
          <option value="200">$200+/hr</option>
        </FilterSelect>

        <FilterSelect
          value={filters.rating}
          onChange={(e) => handleFilterChange('rating', e.target.value)}
        >
          <option value="all">All Ratings</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
        </FilterSelect>
      </FilterContainer>

      {filteredPeers.length === 0 ? (
        <EmptyState>
          <h3>No peers found</h3>
          <p>Try adjusting your filters or search terms</p>
        </EmptyState>
      ) : (
        <PeersGrid>
          {filteredPeers.map(peer => (
            <PeerCard
              key={peer.postId}
              peer={peer}
              space={{}} // This would be the actual 3Box space
              mainThread={{}} // This would be the main thread
              dmThread={[]} // This would be existing DM threads
              createNewConfidentialThread={() => {}} // Implementation needed
              setActiveChat={() => {}} // Implementation needed
              viewMessages={() => {}} // Implementation needed
              openChatModal={() => {}} // Implementation needed
              configureStream={() => {}} // Implementation needed
            />
          ))}
        </PeersGrid>
      )}
    </MarketplaceContainer>
  )
}

export default PeerMarketplace