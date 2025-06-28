import { handleAsyncError } from './validation'

// Performance monitoring utilities
export class PerformanceTracker {
  private static instance: PerformanceTracker
  private metrics: Map<string, number> = new Map()
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  startTracking(): void {
    // Track navigation timing
    this.trackNavigationTiming()
    
    // Track resource loading
    this.trackResourceTiming()
    
    // Track user interactions
    this.trackUserTiming()
    
    // Track layout shifts
    this.trackLayoutShifts()
  }

  private trackNavigationTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          this.metrics.set('loadTime', navEntry.loadEventEnd - navEntry.loadEventStart)
          this.metrics.set('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart)
          this.metrics.set('firstByte', navEntry.responseStart - navEntry.requestStart)
        }
      }
    })
    
    observer.observe({ entryTypes: ['navigation'] })
    this.observers.push(observer)
  }

  private trackResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          const loadTime = resourceEntry.responseEnd - resourceEntry.startTime
          
          if (loadTime > 1000) { // Log slow resources
            console.warn(`Slow resource: ${resourceEntry.name} took ${loadTime}ms`)
          }
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
    this.observers.push(observer)
  }

  private trackUserTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.set(entry.name, entry.duration)
      }
    })
    
    observer.observe({ entryTypes: ['measure'] })
    this.observers.push(observer)
  }

  private trackLayoutShifts(): void {
    if ('LayoutShift' in window) {
      const observer = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.metrics.set('cumulativeLayoutShift', clsValue)
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    }
  }

  markStart(name: string): void {
    performance.mark(`${name}-start`)
  }

  markEnd(name: string): void {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name)
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// HOC for tracking component render performance
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return function PerformanceTrackedComponent(props: P) {
    const tracker = PerformanceTracker.getInstance()
    
    React.useEffect(() => {
      tracker.markStart(`${componentName}-render`)
      return () => {
        tracker.markEnd(`${componentName}-render`)
      }
    }, [tracker])

    return React.createElement(WrappedComponent, props)
  }
}

// Hook for tracking async operations
export function usePerformanceTracking(operationName: string) {
  const tracker = PerformanceTracker.getInstance()
  
  const trackOperation = handleAsyncError(async <T>(operation: () => Promise<T>): Promise<T> => {
    tracker.markStart(operationName)
    try {
      const result = await operation()
      tracker.markEnd(operationName)
      return result
    } catch (error) {
      tracker.markEnd(`${operationName}-error`)
      throw error
    }
  })

  return { trackOperation }
}

// Web Vitals tracking
export const trackWebVitals = (onPerfEntry?: (metric: any) => void): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry)
      getFID(onPerfEntry)
      getFCP(onPerfEntry)
      getLCP(onPerfEntry)
      getTTFB(onPerfEntry)
    })
  }
}