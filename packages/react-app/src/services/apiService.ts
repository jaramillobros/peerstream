import { ethers } from 'ethers'
import { ApiResponse } from '../types'
import { handleAsyncError, AppError } from '../utils/validation'

class ApiService {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string = process.env.REACT_APP_API_URL || '/api') {
    this.baseUrl = baseUrl
  }

  setAuthToken = (token: string): void => {
    this.authToken = token
  }

  private getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    return headers
  }

  private handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new AppError(error.message || 'API request failed', 'API_ERROR', response.status)
    }

    const data = await response.json()
    return {
      success: true,
      data,
      code: response.status
    }
  }

  get = handleAsyncError(async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders()
    })
    return this.handleResponse<T>(response)
  })

  post = handleAsyncError(async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse<T>(response)
  })

  put = handleAsyncError(async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse<T>(response)
  })

  delete = handleAsyncError(async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    return this.handleResponse<T>(response)
  })

  // WebSocket connection for real-time updates
  createWebSocket = (endpoint: string): WebSocket => {
    const wsUrl = this.baseUrl.replace('http', 'ws') + endpoint
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      if (this.authToken) {
        ws.send(JSON.stringify({ type: 'auth', token: this.authToken }))
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return ws
  }

  // Sign message for authentication
  signMessage = handleAsyncError(async (
    message: string, 
    signer: ethers.Signer
  ): Promise<string> => {
    return await signer.signMessage(message)
  })

  // Verify signature
  verifySignature = handleAsyncError(async (
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> => {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature)
      return recoveredAddress.toLowerCase() === address.toLowerCase()
    } catch {
      return false
    }
  })
}

export const apiService = new ApiService()
export default apiService