import { useState, useCallback } from 'react'
import { LoadingState } from '../types'
import { useNotification } from './useNotification'

interface UseAsyncOperationOptions {
  showSuccessMessage?: boolean
  showErrorMessage?: boolean
  successMessage?: string
  errorMessage?: string
}

export const useAsyncOperation = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: UseAsyncOperationOptions = {}
) => {
  const [state, setState] = useState<LoadingState>({ isLoading: false })
  const { showSuccess, showError } = useNotification()

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    setState({ isLoading: true, error: undefined })
    
    try {
      const result = await operation(...args)
      
      setState({ isLoading: false })
      
      if (options.showSuccessMessage) {
        showSuccess(options.successMessage || 'Operation completed successfully')
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      setState({ isLoading: false, error: errorMessage })
      
      if (options.showErrorMessage !== false) {
        showError(options.errorMessage || errorMessage)
      }
      
      return null
    }
  }, [operation, options, showSuccess, showError])

  const reset = useCallback(() => {
    setState({ isLoading: false, error: undefined })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}