import React, { createContext, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { apiService } from '../../services/apiService'
import { useNotification } from '../../hooks/useNotification'

interface SecurityContextType {
  isAuthenticated: boolean
  authenticate: () => Promise<boolean>
  logout: () => void
  checkPermission: (action: string) => boolean
  encryptData: (data: string) => Promise<string>
  decryptData: (encryptedData: string) => Promise<string>
}

const SecurityContext = createContext<SecurityContextType | null>(null)

export const useSecurityContext = (): SecurityContextType => {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider')
  }
  return context
}

interface SecurityProviderProps {
  children: React.ReactNode
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const { account, library } = useWeb3React()
  const { showError, showSuccess } = useNotification()

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('auth_token')
    if (token) {
      setAuthToken(token)
      setIsAuthenticated(true)
      apiService.setAuthToken(token)
    }
  }, [])

  const authenticate = async (): Promise<boolean> => {
    if (!account || !library) {
      showError('Please connect your wallet first')
      return false
    }

    try {
      const signer = library.getSigner()
      const message = `Sign this message to authenticate with Peer Stream.\n\nTimestamp: ${Date.now()}`
      
      const signature = await apiService.signMessage(message, signer)
      
      // Verify signature and get auth token
      const response = await apiService.post('/auth/login', {
        address: account,
        message,
        signature
      })

      if (response.success && response.data?.token) {
        const token = response.data.token
        setAuthToken(token)
        setIsAuthenticated(true)
        localStorage.setItem('auth_token', token)
        apiService.setAuthToken(token)
        showSuccess('Successfully authenticated!')
        return true
      }

      return false
    } catch (error) {
      console.error('Authentication failed:', error)
      showError('Authentication failed. Please try again.')
      return false
    }
  }

  const logout = (): void => {
    setAuthToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth_token')
    apiService.setAuthToken('')
    showSuccess('Logged out successfully')
  }

  const checkPermission = (action: string): boolean => {
    // Implement role-based access control
    if (!isAuthenticated) return false
    
    // For now, all authenticated users have all permissions
    // In production, this would check user roles and permissions
    return true
  }

  const encryptData = async (data: string): Promise<string> => {
    // Implement client-side encryption
    // This is a simplified example - use proper encryption in production
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      
      // Generate a key for encryption
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12))
      
      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      )
      
      // Export key for storage (in production, use secure key management)
      const exportedKey = await crypto.subtle.exportKey('raw', key)
      
      // Combine key, iv, and encrypted data
      const combined = new Uint8Array(exportedKey.byteLength + iv.length + encrypted.byteLength)
      combined.set(new Uint8Array(exportedKey), 0)
      combined.set(iv, exportedKey.byteLength)
      combined.set(new Uint8Array(encrypted), exportedKey.byteLength + iv.length)
      
      // Convert to base64
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  const decryptData = async (encryptedData: string): Promise<string> => {
    try {
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )
      
      // Extract key, iv, and encrypted data
      const keyData = combined.slice(0, 32)
      const iv = combined.slice(32, 44)
      const encrypted = combined.slice(44)
      
      // Import key
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      )
      
      // Convert back to string
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  const value: SecurityContextType = {
    isAuthenticated,
    authenticate,
    logout,
    checkPermission,
    encryptData,
    decryptData
  }

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  )
}

export default SecurityProvider