import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useDeviceCapabilities from './useDeviceCapabilities'
import usePrefersReducedMotion from './usePrefersReducedMotion'

export default function useMagnetic({ radius = 140, strength = 0.35 } = {}) {
  const ref = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const { shouldReduceEffects } = useDeviceCapabilities()
  const disabled = prefersReducedMotion || shouldReduceEffects

  useEffect(() => {
    if (disabled) return
    const el = ref.current
    if (!el) return

    const setX = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const setY = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })

    const onMove = (event) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = event.clientX - cx
      const dy = event.clientY - cy
      const dist = Math.hypot(dx, dy)
      if (dist > radius) {
        setX(0)
        setY(0)
        return
      }
      setX(dx * strength)
      setY(dy * strength)
    }

    const onLeave = () => {
      setX(0)
      setY(0)
    }

    window.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      gsap.set(el, { clearProps: 'x,y' })
    }
  }, [disabled, radius, strength])

  return ref
}
