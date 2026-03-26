import { useEffect, useRef } from 'react'

/**
 * Reveals elements within `ref.current` that match `selector` by adding the `visible` class.
 * Also supports staggering and an optional `onIntersect` callback.
 *
 * @param {object} options
 * @param {number} options.threshold
 * @param {number} options.staggerMs
 * @param {number} options.initialDelayMs
 * @param {boolean} options.once
 * @param {string} options.selector
 * @param {(ctx: { target: Element, revealed: NodeListOf<Element> }) => void} options.onIntersect
 */
export default function useRevealOnScroll({
  threshold = 0.1,
  staggerMs = 100,
  initialDelayMs = 0,
  once = true,
  selector = '[data-reveal]',
  onIntersect,
} = {}) {
  const sectionRef = useRef(null)
  const hasRevealedRef = useRef(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const revealedClass = 'visible'
    const timeouts = []
    let onIntersectCleanup = null
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

    const revealNow = () => {
      const revealed = el.querySelectorAll(selector)
      revealed.forEach((node) => node.classList.add(revealedClass))
      const cleanup = onIntersect?.({ target: el, revealed })
      if (typeof cleanup === 'function') onIntersectCleanup = cleanup
    }

    const revealStaggered = () => {
      const revealed = el.querySelectorAll(selector)
      revealed.forEach((node, i) => {
        const t = setTimeout(() => node.classList.add(revealedClass), initialDelayMs + i * staggerMs)
        timeouts.push(t)
      })
      // Let the caller run additional logic at the start of the reveal
      timeouts.push(
        setTimeout(() => {
          const cleanup = onIntersect?.({ target: el, revealed })
          if (typeof cleanup === 'function') onIntersectCleanup = cleanup
        }, initialDelayMs)
      )
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (once && hasRevealedRef.current) return

          hasRevealedRef.current = true
          if (reducedMotion) revealNow()
          else revealStaggered()

          if (once) observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(el)

    return () => {
      timeouts.forEach(clearTimeout)
      onIntersectCleanup?.()
      observer.disconnect()
    }
  }, [threshold, staggerMs, initialDelayMs, once, selector, onIntersect])

  return sectionRef
}

