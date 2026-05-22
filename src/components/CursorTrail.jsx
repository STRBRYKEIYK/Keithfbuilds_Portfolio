import { useEffect, useMemo, useRef } from 'react'
import useDeviceCapabilities from '../hooks/useDeviceCapabilities'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

const TRAIL_COUNT = 10
const COLORS = ['var(--riso-red)', 'var(--riso-cyan)']

export default function CursorTrail() {
  const { canUseCustomCursor } = useDeviceCapabilities()
  const prefersReducedMotion = usePrefersReducedMotion()
  const enabled = canUseCustomCursor && !prefersReducedMotion

  const refs = useMemo(() => Array.from({ length: TRAIL_COUNT }, () => ({ current: null })), [])
  const lastPos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    if (!enabled) return
    const positions = Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
    let raf = 0

    const onMove = (event) => {
      lastPos.current = { x: event.clientX, y: event.clientY }
    }

    const tick = () => {
      positions[0].x += (lastPos.current.x - positions[0].x) * 0.32
      positions[0].y += (lastPos.current.y - positions[0].y) * 0.32
      for (let i = 1; i < TRAIL_COUNT; i++) {
        positions[i].x += (positions[i - 1].x - positions[i].x) * 0.34
        positions[i].y += (positions[i - 1].y - positions[i].y) * 0.34
      }
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = refs[i].current
        if (!el) continue
        const scale = 1 - i / TRAIL_COUNT
        el.style.transform = `translate(${positions[i].x - 4}px, ${positions[i].y - 4}px) scale(${0.4 + scale * 0.6})`
        el.style.opacity = String(0.55 * scale)
      }
      raf = window.requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [enabled, refs])

  if (!enabled) return null

  return (
    <div aria-hidden="true">
      {refs.map((ref, i) => (
        <span
          key={i}
          ref={(el) => {
            ref.current = el
          }}
          className="cursor-trail-dot"
          style={{ background: COLORS[i % COLORS.length] }}
        />
      ))}
    </div>
  )
}
