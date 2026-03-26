import { useEffect, useRef, useState } from 'react'

/**
 * Boot overlay timing controller.
 *
 * @param {object} options
 * @param {string[]} options.bootLines
 * @param {(void) => void} options.onDone
 * @param {number} options.durationMs
 * @param {number} options.leaveDelayMs
 */
export default function useBootLoader({ bootLines, onDone, durationMs = 2500, leaveDelayMs = 700 }) {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [visibleLines, setVisibleLines] = useState([])

  const mountTimeRef = useRef(Date.now())

  useEffect(() => {
    const DURATION = durationMs
    let rafId = 0
    let doneTimeoutId = 0

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reducedMotion) {
      setProgress(100)
      setLeaving(true)
      // Skip the timed overlay for reduced-motion users.
      window.setTimeout(onDone, 0)
      return
    }

    const tick = () => {
      const elapsed = Date.now() - mountTimeRef.current
      const pct = Math.min(100, (elapsed / DURATION) * 100)
      setProgress(pct)

      if (pct < 100) {
        rafId = requestAnimationFrame(tick)
        return
      }

      setLeaving(true)
      doneTimeoutId = window.setTimeout(onDone, leaveDelayMs)
    }

    rafId = requestAnimationFrame(tick)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (doneTimeoutId) window.clearTimeout(doneTimeoutId)
    }
  }, [durationMs, leaveDelayMs, onDone])

  useEffect(() => {
    const lineIndex = Math.floor((progress / 100) * bootLines.length)
    setVisibleLines(bootLines.slice(0, lineIndex))
  }, [progress, bootLines])

  return { progress, leaving, visibleLines }
}

