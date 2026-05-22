import { useEffect, useRef } from 'react'
import useDeviceCapabilities from './useDeviceCapabilities'
import usePrefersReducedMotion from './usePrefersReducedMotion'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function useTilt({ maxDeg = 8 } = {}) {
  const ref = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const { shouldReduceEffects } = useDeviceCapabilities()
  const disabled = prefersReducedMotion || shouldReduceEffects

  useEffect(() => {
    if (disabled) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let pendingX = 0
    let pendingY = 0

    const apply = () => {
      el.style.setProperty('--tilt-x', `${pendingX.toFixed(2)}deg`)
      el.style.setProperty('--tilt-y', `${pendingY.toFixed(2)}deg`)
      raf = 0
    }

    const onMove = (event) => {
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      pendingY = clamp((px - 0.5) * 2 * maxDeg, -maxDeg, maxDeg)
      pendingX = clamp((0.5 - py) * 2 * maxDeg, -maxDeg, maxDeg)
      if (!raf) raf = window.requestAnimationFrame(apply)
    }

    const onLeave = () => {
      pendingX = 0
      pendingY = 0
      if (!raf) raf = window.requestAnimationFrame(apply)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (raf) window.cancelAnimationFrame(raf)
      el.style.removeProperty('--tilt-x')
      el.style.removeProperty('--tilt-y')
    }
  }, [disabled, maxDeg])

  return ref
}
