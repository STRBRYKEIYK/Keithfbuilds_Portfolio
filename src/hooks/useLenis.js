import { useEffect } from 'react'
import Lenis from 'lenis'
import useDeviceCapabilities from './useDeviceCapabilities'
import usePrefersReducedMotion from './usePrefersReducedMotion'

/**
 * Mounts a Lenis smooth-scroll instance on the document.
 * Gated by device capabilities and the user's prefers-reduced-motion setting.
 * Call from any route component that wants vertical smooth scroll
 * (Project, NotFound). Do NOT call from Home — Home has a custom
 * horizontal rail wheel handler that conflicts with Lenis.
 */
export default function useLenis() {
  const { canUseLenis } = useDeviceCapabilities()
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!canUseLenis || prefersReducedMotion) return

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    })

    let frameId = 0
    const raf = (time) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
    }
  }, [canUseLenis, prefersReducedMotion])
}
