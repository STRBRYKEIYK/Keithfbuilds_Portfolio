import { useEffect, useRef } from 'react'

/**
 * Smooth scrolling via Lenis (dynamic import).
 * Automatically disables when `enabled` is false or when prefers-reduced-motion is set.
 *
 * @param {boolean} enabled
 */
export default function useSmoothLenis(enabled) {
  const lenisRef = useRef(null)
  const rafIdRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reducedMotion) return

    let cancelled = false

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      })

      lenisRef.current = lenis

      const raf = (time) => {
        lenis.raf(time)
        rafIdRef.current = requestAnimationFrame(raf)
      }

      rafIdRef.current = requestAnimationFrame(raf)
    })

    return () => {
      cancelled = true
      const rafId = rafIdRef.current
      if (rafId) cancelAnimationFrame(rafId)
      lenisRef.current?.destroy?.()
      lenisRef.current = null
    }
  }, [enabled])
}

