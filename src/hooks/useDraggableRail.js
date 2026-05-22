import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function useDraggableRail() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let isDown = false
    let startX = 0
    let startScroll = 0
    let lastX = 0
    let lastT = 0
    let velocity = 0
    let momentumTween = null

    const killTween = () => {
      if (momentumTween) {
        momentumTween.kill()
        momentumTween = null
      }
    }

    const onPointerDown = (event) => {
      // Only react to primary pointer drag; let touch use native horizontal scroll.
      if (event.pointerType === 'touch') return
      killTween()
      isDown = true
      startX = event.clientX
      lastX = event.clientX
      lastT = performance.now()
      startScroll = el.scrollLeft
      el.classList.add('dragging')
      el.setPointerCapture?.(event.pointerId)
    }

    const onPointerMove = (event) => {
      if (!isDown) return
      const dx = event.clientX - startX
      el.scrollLeft = startScroll - dx
      const now = performance.now()
      const dt = Math.max(1, now - lastT)
      velocity = (event.clientX - lastX) / dt
      lastX = event.clientX
      lastT = now
    }

    const release = () => {
      if (!isDown) return
      isDown = false
      el.classList.remove('dragging')

      // Throw with momentum proportional to velocity at release.
      const target = Math.max(
        0,
        Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft - velocity * 240)
      )
      if (Math.abs(velocity) > 0.04) {
        momentumTween = gsap.to(el, {
          scrollLeft: target,
          duration: 0.9,
          ease: 'power3.out',
        })
      }
      velocity = 0
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', release)
    el.addEventListener('pointercancel', release)
    el.addEventListener('pointerleave', release)

    return () => {
      killTween()
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', release)
      el.removeEventListener('pointercancel', release)
      el.removeEventListener('pointerleave', release)
    }
  }, [])

  const scrollBy = (delta) => {
    const el = ref.current
    if (!el) return
    gsap.to(el, {
      scrollLeft: Math.max(0, Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + delta)),
      duration: 0.5,
      ease: 'power3.out',
    })
  }

  return { ref, scrollBy }
}
