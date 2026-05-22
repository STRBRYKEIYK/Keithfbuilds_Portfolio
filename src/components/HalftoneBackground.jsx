import { useEffect, useRef } from 'react'
import useDeviceCapabilities from '../hooks/useDeviceCapabilities'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

export default function HalftoneBackground() {
  const layerRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const { canUseDotGrid, shouldReduceEffects } = useDeviceCapabilities()
  const isInteractive = canUseDotGrid && !prefersReducedMotion && !shouldReduceEffects

  useEffect(() => {
    if (!isInteractive) return
    const root = document.documentElement
    let raf = 0
    let nextX = 50
    let nextY = 50

    const onMove = (event) => {
      nextX = (event.clientX / window.innerWidth) * 100
      nextY = (event.clientY / window.innerHeight) * 100
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        root.style.setProperty('--halftone-mx', `${nextX}%`)
        root.style.setProperty('--halftone-my', `${nextY}%`)
        raf = 0
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [isInteractive])

  return (
    <div className="halftone-bg" aria-hidden="true" ref={layerRef}>
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="halftone-pattern" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.2" fill="rgba(16,16,16,0.32)" />
          </pattern>
          <radialGradient id="halftone-glow" cx="var(--halftone-mx, 50%)" cy="var(--halftone-my, 50%)" r="40%">
            <stop offset="0%" stopColor="rgba(255,58,47,0.18)" />
            <stop offset="55%" stopColor="rgba(26,208,212,0.10)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#halftone-pattern)" />
        {isInteractive && <rect width="100%" height="100%" fill="url(#halftone-glow)" />}
      </svg>
    </div>
  )
}
