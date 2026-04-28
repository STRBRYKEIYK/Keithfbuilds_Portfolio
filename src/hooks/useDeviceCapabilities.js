import { useMemo } from 'react'

/**
 * Detects device capabilities and performance characteristics.
 * Disables heavy features on low-end devices and Mac.
 */
export default function useDeviceCapabilities() {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        isLowEnd: false,
        isMac: false,
        isTablet: false,
        canUseHeavyAnimations: true,
      }
    }

    // Detect Mac
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

    // Detect low-end device (CPU cores, memory, etc.)
    const cores = navigator.hardwareConcurrency || 4
    const isLowEnd = cores <= 2 || navigator.deviceMemory <= 2

    // Detect tablet
    const isTablet = 
      (/android|ipad|playbook|silk/i.test(navigator.userAgent)) ||
      (navigator.maxTouchPoints > 2 && !isMac)

    // Connection-based detection
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    const isSlowConnection = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'

    return {
      isLowEnd,
      isMac,
      isTablet,
      isSlowConnection,
      // Disable heavy animations on Mac, low-end, or slow connection
      canUseCustomCursor: !isMac && !isLowEnd && !isTablet,
      canUseDotGrid: !isMac && !isLowEnd && !isTablet,
      canUseLenis: !isLowEnd && !isSlowConnection,
      shouldReduceEffects: isMac || isLowEnd || isTablet,
    }
  }, [])
}
