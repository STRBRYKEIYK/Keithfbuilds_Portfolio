import { useEffect, useRef, useState } from 'react'

/**
 * Tracks which section is "active" based on a vertical reference line.
 *
 * @param {string[]} sectionIds
 * @param {object} options
 * @param {number} options.referenceTopPx
 */
export default function useScrollSpy(sectionIds, { referenceTopPx = 120 } = {}) {
  const [activeId, setActiveId] = useState('')
  const rafRef = useRef(0)

  useEffect(() => {
    const ids = Array.isArray(sectionIds) ? sectionIds : []
    if (ids.length === 0) return

    const computeActive = () => {
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue

        const rect = el.getBoundingClientRect()
        if (rect.top <= referenceTopPx && rect.bottom >= referenceTopPx) {
          setActiveId(id)
          return
        }
      }
    }

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(computeActive)
    }

    computeActive()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', onScroll)
    }
  }, [sectionIds, referenceTopPx])

  return activeId
}

