import { useMemo } from 'react'

/**
 * Hook to check if user prefers reduced motion or device is low-end
 * Useful for conditionally applying animations and heavy effects
 */
export default function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === 'undefined') return true

    // Check user preference
    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false

    // Check device capability
    const cores = navigator.hardwareConcurrency || 4
    const isLowEnd = cores <= 2
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)

    // Disable animations if user prefers reduced motion, device is low-end, or on Mac
    return prefersReducedMotion || isLowEnd || isMac
  }, [])
}
