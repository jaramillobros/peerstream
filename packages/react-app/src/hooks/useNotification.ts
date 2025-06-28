import { useCallback } from 'react'
import { useAlert } from 'react-alert'
import { NotificationConfig } from '../types'

export const useNotification = () => {
  const alert = useAlert()

  const showNotification = useCallback((config: NotificationConfig) => {
    const { type, title, message, duration = 5000 } = config
    
    const fullMessage = title ? `${title}: ${message}` : message
    
    switch (type) {
      case 'success':
        alert.success(fullMessage, { timeout: duration })
        break
      case 'error':
        alert.error(fullMessage, { timeout: duration })
        break
      case 'warning':
        alert.show(fullMessage, { type: 'info', timeout: duration })
        break
      case 'info':
        alert.info(fullMessage, { timeout: duration })
        break
      default:
        alert.show(fullMessage, { timeout: duration })
    }
  }, [alert])

  const showSuccess = useCallback((message: string, title?: string) => {
    showNotification({ type: 'success', title: title || 'Success', message })
  }, [showNotification])

  const showError = useCallback((message: string, title?: string) => {
    showNotification({ type: 'error', title: title || 'Error', message })
  }, [showNotification])

  const showWarning = useCallback((message: string, title?: string) => {
    showNotification({ type: 'warning', title: title || 'Warning', message })
  }, [showNotification])

  const showInfo = useCallback((message: string, title?: string) => {
    showNotification({ type: 'info', title: title || 'Info', message })
  }, [showNotification])

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}