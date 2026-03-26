import { useEffect, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'

/**
 * rAF-based scramble.
 * Resolves to `finalText` in ~800ms when `trigger` flips true.
 *
 * @param {string} finalText
 * @param {boolean} trigger
 */
export default function useScramble(finalText, trigger) {
  const [display, setDisplay] = useState(finalText)
  const raf = useRef(0)
  const progress = useRef(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (!trigger) {
      setDisplay(finalText)
      return
    }

    if (reducedMotion) {
      setDisplay(finalText)
      return
    }

    progress.current = 0
    window.cancelAnimationFrame(raf.current)

    let last = 0
    function step(ts) {
      if (ts - last < 26) {
        raf.current = window.requestAnimationFrame(step)
        return
      }
      last = ts
      progress.current += 0.6

      const p = progress.current
      const next = finalText
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' '
          if (i < p) return finalText[i]
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')

      setDisplay(next)

      if (p < finalText.length) raf.current = window.requestAnimationFrame(step)
      else setDisplay(finalText)
    }

    raf.current = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(raf.current)
  }, [trigger, finalText])

  return display
}

