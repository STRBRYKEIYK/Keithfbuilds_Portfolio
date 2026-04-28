/**
 * Performance monitoring and metrics collection
 * Helps track FPS, memory usage, and performance issues
 */

export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Log device capabilities
  console.log('%c📱 Device Capabilities', 'color: #22c55e; font-weight: bold;', {
    'CPU Cores': navigator.hardwareConcurrency || 'Unknown',
    'Device Memory (GB)': navigator.deviceMemory || 'Unknown',
    'Network Speed': navigator.connection?.effectiveType || 'Unknown',
    'User Agent': navigator.userAgent,
    'Reduced Motion': window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '✓ Enabled' : '✗ Disabled',
  })

  // Monitor Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log(`%c⏱️ LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`, 'color: #3b82f6')
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(`%c⚡ FID: ${entry.processingDuration}ms`, 'color: #f59e0b')
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // FID not supported
    }
  }

  // Monitor memory usage (if available)
  if (performance.memory) {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory
    console.log(
      '%c💾 Memory Usage',
      'color: #8b5cf6; font-weight: bold;',
      {
        'Used': `${Math.round(usedJSHeapSize / 1048576)}MB`,
        'Total': `${Math.round(totalJSHeapSize / 1048576)}MB`,
        'Limit': `${Math.round(jsHeapSizeLimit / 1048576)}MB`,
      }
    )
  }

  // Log initial page speed
  window.addEventListener('load', () => {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    console.log(`%c✅ Page Load Time: ${pageLoadTime}ms`, 'color: #22c55e; font-weight: bold;')
  })
}

/**
 * Monitor FPS during scroll/interactions
 */
export function monitorFPS() {
  if (typeof window === 'undefined') return

  let frameCount = 0
  let lastTime = performance.now()

  const measureFPS = () => {
    frameCount++
    const currentTime = performance.now()
    const elapsed = currentTime - lastTime

    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed)
      const color = fps >= 60 ? '#22c55e' : fps >= 30 ? '#f59e0b' : '#ef4444'
      console.log(`%c🎯 FPS: ${fps}`, `color: ${color}; font-weight: bold;`)

      frameCount = 0
      lastTime = currentTime
    }

    requestAnimationFrame(measureFPS)
  }

  // Start monitoring on user interaction
  const startMonitoring = () => {
    console.log('%c🎬 FPS Monitoring Started', 'color: #22c55e')
    requestAnimationFrame(measureFPS)
    document.removeEventListener('scroll', startMonitoring)
    window.removeEventListener('mousemove', startMonitoring)
  }

  document.addEventListener('scroll', startMonitoring, { once: true })
  window.addEventListener('mousemove', startMonitoring, { once: true })
}

/**
 * Log performance metrics at page load
 */
export function logPerformanceMetrics() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint')

      if (navigation) {
        console.group('%c📊 Performance Metrics', 'color: #3b82f6; font-weight: bold;')
        console.log(`DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`)
        console.log(`TCP Connection: ${Math.round(navigation.connectEnd - navigation.connectStart)}ms`)
        console.log(`Request Time: ${Math.round(navigation.responseStart - navigation.requestStart)}ms`)
        console.log(`DOM Interactive: ${Math.round(navigation.domInteractive - navigation.navigationStart)}ms`)
        console.log(`DOM Complete: ${Math.round(navigation.domComplete - navigation.navigationStart)}ms`)
        console.log(`Load Complete: ${Math.round(navigation.loadEventEnd - navigation.navigationStart)}ms`)
        console.groupEnd()
      }

      if (paint.length > 0) {
        console.group('%c🎨 Paint Timing', 'color: #ec4899; font-weight: bold;')
        paint.forEach((p) => {
          console.log(`${p.name}: ${Math.round(p.startTime)}ms`)
        })
        console.groupEnd()
      }
    }, 0)
  })
}
